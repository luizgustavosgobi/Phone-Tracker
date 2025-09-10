import os
import glob
from ultralytics import YOLO
import pandas as pd

import plots
from eval.metrics_utils import calc_f1_score, generate_metrics_dict, extract_yolo_class_metrics
from rf_detr import eval_rfdetr

MODELS_PATH = "../models"
YOLO_DATASET_PATH="datasets/usInSchool-yolo/data.yaml"
RFDETR_DATASET_PATH="datasets/usInSchool-coco"

def evaluate_all_models(models_path, yolo_dataset_path, coco_dataset_path):
    yolo_models = glob.glob(os.path.join(models_path, "yolo*.pt"))
    roboflow_models = glob.glob(os.path.join(models_path, "roboflow*.pt"))
    detr_models = glob.glob(os.path.join(models_path, "*detr*.pt"))

    results_data = []
    results_data_per_class = []

    for model_path in yolo_models + roboflow_models:
        model_name = os.path.basename(model_path)
        print(f"Avaliando modelo YOLO: {model_name}")

        try:
            model = YOLO(model_path)
            results = model.val(data=yolo_dataset_path, plots=True, device=0)

            box_results = results.box
            mAP50 = getattr(box_results, 'map50', 0.0)
            mAP50_95 = getattr(box_results, 'map', 0.0)
            precision = getattr(box_results, 'mp', 0.0)
            recall = getattr(box_results, 'mr', 0.0)
            f1_score = calc_f1_score(precision, recall)

            results_data.append(generate_metrics_dict(model_name, mAP50, mAP50_95, precision, recall, f1_score, model_type='YOLO'))
            results_data_per_class.extend(extract_yolo_class_metrics(results, model_name))

        except Exception as e:
            print(f"Erro ao avaliar YOLO {model_name}: {str(e)}")
            continue

    for model_path in detr_models:
        model_name = os.path.basename(model_path)
        print(f"Avaliando modelo RF-DETR: {model_name}")

        size = model_name.split('-')[1]
        detr_results = eval_rfdetr(coco_dataset_path, model_path, size)

        for result in detr_results:
            mAP50 = result['map@50']
            mAP50_95 = result['map@50:95']
            precision = result['precision']
            recall = result['recall']
            f1_score = calc_f1_score(precision, recall)

            metrics = generate_metrics_dict(
                model_name,
                mAP50,
                mAP50_95,
                precision,
                recall,
                f1_score,
                model_type='RF-DETR',
                class_name=(None if result['class'] == "all" else result['class'])
            )

            if result['class'] == "all":
                results_data.append(metrics)
            else:
                results_data_per_class.append(metrics)

    if results_data:
        os.makedirs('plots', exist_ok=True)

        df = pd.DataFrame(results_data)
        df.to_csv(os.path.join('plots','model_evaluation_results.csv'), index=False)

        plots.create_performance_plots(df)
        plots.create_ranking_plot(df)

        plots.create_mixed_performance_plots(df)

        if results_data_per_class:
            plots.create_class_performance_plots(results_data_per_class)
            plots.create_performance_heatmap(results_data_per_class)

            df_per_class = pd.DataFrame(results_data_per_class)
            df_per_class.to_csv(os.path.join('plots','model_evaluation_per_class.csv'), index=False)

if __name__ == "__main__":
    evaluate_all_models(MODELS_PATH, YOLO_DATASET_PATH, RFDETR_DATASET_PATH)