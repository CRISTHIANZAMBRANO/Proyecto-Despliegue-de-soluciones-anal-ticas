import os
import glob
import pandas as pd
from kaggle.api.kaggle_api_extended import KaggleApi

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
    print("Primeras filas:")
    print(df.head())
    df.info()
    df.describe().T

if __name__ == "__main__":
    main()
