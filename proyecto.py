import os
import glob
import pandas as pd
from kaggle.api.kaggle_api_extended import KaggleApi
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
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

    #Verificamos si hay valores nulos, conclusion: No hay valores nulos
    print(df.isnull().sum())

    
    #cuantas personas fuman, cuantas toman alcohol y conteo de genero
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

    # ------------------------------
    # 1️ Matriz de correlaciones
    # ------------------------------
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


    # ------------------------------
    # 2️ Scatter plots con líneas de tendencia
    # ------------------------------
    for var in variables:
        if df[var].dtype != 'int64' and df[var].dtype != 'float64':
            continue

        x = df[var].values
        y = df[target].values

        # Ajuste lineal
        m, b = np.polyfit(x, y, 1)

        plt.figure()
        plt.scatter(x, y, alpha=0.3)
        plt.plot(np.sort(x), m*np.sort(x) + b)
        plt.xlabel(var)
        plt.ylabel("disease_risk")
        plt.title(f"{var} vs disease_risk")
        plt.tight_layout()
        plt.show()


    # ------------------------------
    # 3️ Gráfico de barras de correlaciones
    # ------------------------------
    corr_values = corr[target].drop(target).abs().sort_values()

    plt.figure()
    corr_values.plot(kind='barh')
    plt.title("Correlación absoluta con disease_risk")
    plt.xlabel("|correlación|")
    plt.tight_layout()
    plt.show()

    print("\n Nos damos cuenta que realmente este dataset fue generado con fines academicos y no contiene informacion real, asi que lo modificaremos para que se ajuste a un escenario mas real")

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

    # Ajustar para que los valores queden entre 0 y 1
    risk = (risk - risk.min()) / (risk.max() - risk.min())

    # Crear una nueva columna binaria de riesgo (umbral = mediana)
    df["disease_risk_real"] = (risk > risk.median()).astype(int)

    # ===============================
    # NUEVAS GRÁFICAS CON LA COLUMNA NUEVA
    # ===============================

    variables_risk = ["age", "bmi", "cholesterol", "systolic_bp", "smoker", 
                      "alcohol", "daily_steps", "sleep_hours", "family_history"]
    target = "disease_risk_real"

    # 1️ Matriz de correlación con el nuevo target
    corr = df[variables_risk + [target]].corr()

    plt.figure(figsize=(10, 8))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm")
    plt.title(" Matriz de correlaciones con 'disease_risk_real'")
    plt.tight_layout()
    plt.show()

    print("\n Correlaciones con disease_risk_real:")
    print(corr[target].sort_values(ascending=False))


    # 2️ Gráfico de barras: fuerza de correlación
    corr_values = corr[target].drop(target).abs().sort_values()

    plt.figure(figsize=(8, 5))
    corr_values.plot(kind="barh", color="teal")
    plt.title(" Correlación Absoluta con 'disease_risk_real'")
    plt.xlabel("|Correlación|")
    plt.tight_layout()
    plt.show()


    # 3️ Scatterplots con recta de regresión
    top_features = list(corr[target].abs().sort_values(ascending=False).index[:4])

    for var in top_features:
        if var == target:
            continue
        plt.figure(figsize=(6, 4))
        sns.regplot(x=df[var], y=df[target], logistic=False, scatter_kws={'alpha':0.3})
        plt.title(f"{var} vs {target}")
        plt.tight_layout()
        plt.show()
    
if __name__ == "__main__":
    main()
