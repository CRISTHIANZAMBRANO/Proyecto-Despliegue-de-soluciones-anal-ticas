import os
import glob
import pandas as pd
from kaggle.api.kaggle_api_extended import KaggleApi
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    ConfusionMatrixDisplay,
)

import mlflow
import mlflow.sklearn
from sklearn.linear_model import LogisticRegression
from xgboost import XGBClassifier

DATASET = "rehan497/health-lifestyle-dataset"
TARGET_DIR = "./data"

def main():
    # Autenticación Kaggle (usa ~/.kaggle/kaggle.json)
    api = KaggleApi()
    api.authenticate()

    os.makedirs(TARGET_DIR, exist_ok=True)

    # Descarga y descomprime automáticamente en ./data
    api.dataset_download_files(DATASET, path=TARGET_DIR, unzip=True)

    csv_files = glob.glob(os.path.join(TARGET_DIR, "**", "*.csv"), recursive=True)
    if not csv_files:
        raise FileNotFoundError("No se encontró ningún .csv en ./data tras la descarga.")
    print("CSV encontrados:", csv_files)

    csv_path = csv_files[0]
    df = pd.read_csv(csv_path, encoding="utf-8", engine="python")
    print(" Imprimimos las primeras filas:")
    print(df.head())
    print(" Verificamos que columnas tiene el dataset, de que tipo es cada dato y cuantos registros no nulos tiene cada campo")
    print(df.info())
    print(df.describe().T)

    # Verificamos si hay valores nulos
    print(df.isnull().sum())

    # cuantas personas fuman, cuantas toman alcohol y conteo de genero
    categorical_cols = ['gender', 'smoker', 'alcohol']
    for col in categorical_cols:
        plt.figure(figsize=(6, 4))
        sns.countplot(data=df, x=col, palette='viridis')
        plt.title(f'Count Plot of {col}')
        plt.tight_layout()
        plt.show()

    # Variables predictoras
    variables = ["age", "bmi", "cholesterol", "systolic_bp", "smoker"]
    target = "disease_risk"

    # 1️ Matriz de correlaciones
    corr = df[variables + [target]].corr()

    plt.figure()
    plt.imshow(corr, interpolation='nearest')
    plt.title("Matriz de correlaciones")
    plt.colorbar()
    plt.xticks(range(len(corr.columns)), corr.columns, rotation=45)
    plt.yticks(range(len(corr.columns)), corr.columns)
    plt.tight_layout()
    plt.show()

    print("\nCorrelaciones con disease_risk:")
    print(corr[target].sort_values(ascending=False))

    # 2️ Scatter plots con líneas de tendencia
    for var in variables:
        if df[var].dtype not in ['int64', 'float64']:
            continue

        x = df[var].values
        y = df[target].values

        m, b = np.polyfit(x, y, 1)

        plt.figure()
        plt.scatter(x, y, alpha=0.3)
        plt.plot(np.sort(x), m*np.sort(x) + b)
        plt.xlabel(var)
        plt.ylabel("disease_risk")
        plt.title(f"{var} vs disease_risk")
        plt.tight_layout()
        plt.show()

    # 3️ Gráfico de barras de correlaciones
    corr_values = corr[target].drop(target).abs().sort_values()

    plt.figure()
    corr_values.plot(kind='barh')
    plt.title("Correlación absoluta con disease_risk")
    plt.xlabel("|correlación|")
    plt.tight_layout()
    plt.show()

    print("\n Nos damos cuenta que este dataset fue generado con fines académicos...")

    # Normalización básica de factores de riesgo
    risk = (
        (df["age"] / df["age"].max()) * 0.15 +
        (df["bmi"] / df["bmi"].max()) * 0.20 +
        (df["cholesterol"] / df["cholesterol"].max()) * 0.15 +
        (df["systolic_bp"] / df["systolic_bp"].max()) * 0.15 +
        (df["alcohol"] / df["alcohol"].max()) * 0.10 +
        (1 - df["sleep_hours"] / df["sleep_hours"].max()) * 0.10 +
        (1 - df["daily_steps"] / df["daily_steps"].max()) * 0.10 +
        df["smoker"] * 0.25 +
        df["family_history"] * 0.30
    )

    risk = (risk - risk.min()) / (risk.max() - risk.min())
    df["disease_risk_real"] = (risk > risk.median()).astype(int)

    # ===============================
    # NUEVAS GRÁFICAS CON LA COLUMNA NUEVA
    # ===============================
    variables_risk = ["age", "bmi", "cholesterol", "systolic_bp", "smoker",
                      "alcohol", "daily_steps", "sleep_hours", "family_history"]
    target = "disease_risk_real"

    corr = df[variables_risk + [target]].corr()

    plt.figure(figsize=(10, 8))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm")
    plt.title(" Matriz de correlaciones con 'disease_risk_real'")
    plt.tight_layout()
    plt.show()

    print("\n Correlaciones con disease_risk_real:")
    print(corr[target].sort_values(ascending=False))

    corr_values = corr[target].drop(target).abs().sort_values()

    plt.figure(figsize=(8, 5))
    corr_values.plot(kind="barh", color="teal")
    plt.title(" Correlación Absoluta con 'disease_risk_real'")
    plt.xlabel("|Correlación|")
    plt.tight_layout()
    plt.show()

    top_features = list(corr[target].abs().sort_values(ascending=False).index[:4])

    for var in top_features:
        if var == target:
            continue
        plt.figure(figsize=(6, 4))
        sns.regplot(x=df[var], y=df[target], logistic=False, scatter_kws={'alpha': 0.3})
        plt.title(f"{var} vs {target}")
        plt.tight_layout()
        plt.show()

    # ===============================
    # 4️ MODELADO + MLFLOW
    # ===============================

    features = ["age", "bmi", "cholesterol", "systolic_bp",
                "smoker", "alcohol", "daily_steps",
                "sleep_hours", "family_history"]
    target = "disease_risk_real"

    X = df[features]
    y = df[target]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Configuración de MLflow (carpeta local mlruns)
    tracking_dir = "file:" + os.path.abspath("./mlruns")
    mlflow.set_tracking_uri(tracking_dir)
    mlflow.set_experiment("health-lifestyle-risk")

    def train_and_log_model(model, model_name, params):
        """
        Entrena un modelo, calcula métricas, genera matriz de confusión
        y lo registra todo en MLflow.
        """
        with mlflow.start_run(run_name=model_name):

            # 1. Log de parámetros
            mlflow.log_params(params)

            # 2. Entrenamiento
            model.fit(X_train, y_train)

            # 3. Predicciones
            y_pred = model.predict(X_test)
            if hasattr(model, "predict_proba"):
                y_proba = model.predict_proba(X_test)[:, 1]
                roc = roc_auc_score(y_test, y_proba)
            else:
                y_proba = None
                roc = None

            acc = accuracy_score(y_test, y_pred)
            f1 = f1_score(y_test, y_pred)

            # 4. Log de métricas numéricas
            mlflow.log_metric("accuracy", acc)
            mlflow.log_metric("f1", f1)
            if roc is not None:
                mlflow.log_metric("roc_auc", roc)

            print(
                f"\n[{model_name}] accuracy={acc:.4f}  f1={f1:.4f}  roc_auc={roc:.4f}"
                if roc is not None
                else f"\n[{model_name}] accuracy={acc:.4f}  f1={f1:.4f}"
            )

            # 5. Matriz de confusión -> imagen -> artifact
            cm = confusion_matrix(y_test, y_pred)

            fig, ax = plt.subplots(figsize=(4, 4))
            disp = ConfusionMatrixDisplay(cm)
            disp.plot(ax=ax, cmap="Blues", colorbar=False)
            ax.set_title(f"Matriz de confusión - {model_name}")
            plt.tight_layout()

            # nombre de archivo por modelo
            plot_path = f"confusion_matrix_{model_name}.png"
            fig.savefig(plot_path)
            plt.close(fig)

            # subir la imagen como artifact a MLflow
            mlflow.log_artifact(plot_path, artifact_path="plots")

            # 6. Guardar el modelo
            mlflow.sklearn.log_model(model, artifact_path="model")

    rf_params = {
        "n_estimators": 200,
        "max_depth": 6,
        "max_features": 4,
        "random_state": 42,
    }
    rf = RandomForestClassifier(
        n_estimators=rf_params["n_estimators"],
        max_depth=rf_params["max_depth"],
        max_features=rf_params["max_features"],
        random_state=rf_params["random_state"],
    )

    train_and_log_model(rf, "RandomForestClassifier", rf_params)

      # ------------------------------
    # Logistic Regression
    # ------------------------------
    logreg_params = {
        "C": 1.0,
        "solver": "liblinear",
        "max_iter": 100,
        "random_state": 42
    }

    logreg = LogisticRegression(
        C=logreg_params["C"],
        solver=logreg_params["solver"],
        max_iter=logreg_params["max_iter"],
        random_state=logreg_params["random_state"]
    )

    train_and_log_model(logreg, "LogisticRegression", logreg_params)

    # ------------------------------
    # XGBoost
    # ------------------------------
    xgb_params = {
        "n_estimators": 300,
        "max_depth": 5,
        "learning_rate": 0.05,
        "subsample": 0.9,
        "colsample_bytree": 0.9,
        "random_state": 42,
        "eval_metric": "logloss"
    }

    xgb = XGBClassifier(
        n_estimators=xgb_params["n_estimators"],
        max_depth=xgb_params["max_depth"],
        learning_rate=xgb_params["learning_rate"],
        subsample=xgb_params["subsample"],
        colsample_bytree=xgb_params["colsample_bytree"],
        random_state=xgb_params["random_state"],
        eval_metric=xgb_params["eval_metric"],
        use_label_encoder=False
    )

    train_and_log_model(xgb, "XGBoostClassifier", xgb_params)


if __name__ == "__main__":
    main()
