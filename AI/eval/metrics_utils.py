
def extract_yolo_class_metrics(results, model_name):
    class_metrics = []

    try:
        if not hasattr(results, 'box'):
            return class_metrics

        box_results = results.box

        if hasattr(box_results, 'ap_class_index') and hasattr(box_results, 'ap'):
            class_indices = box_results.ap_class_index
            class_names = [results.names[int(idx)] for idx in class_indices]

            if hasattr(box_results, 'p'):  # precision
                precisions = box_results.p
            else:
                precisions = [0.0] * len(class_names)

            if hasattr(box_results, 'r'):  # recall
                recalls = box_results.r
            else:
                recalls = [0.0] * len(class_names)

            if hasattr(box_results, 'ap50'):  # mAP@0.5
                ap50s = box_results.ap50
            else:
                ap50s = [0.0] * len(class_names)

            for i, class_name in enumerate(class_names):
                precision = precisions[i] if i < len(precisions) else 0.0
                recall = recalls[i] if i < len(recalls) else 0.0
                ap50 = ap50s[i] if i < len(ap50s) else 0.0
                f1 = calc_f1_score(precision, recall)

                class_metrics.append({
                    'model_name': model_name,
                    'class_name': class_name,
                    'precision': float(precision),
                    'recall': float(recall),
                    'mAP50': float(ap50),
                    'f1_score': float(f1)
                })

    except Exception as e:
        print(f"Erro ao extrair métricas por classe de {model_name}: {str(e)}")

    return class_metrics

def calc_f1_score(precision, recall):
    if precision > 0 and recall > 0:
        f1 = 2 * (precision * recall) / (precision + recall)
    else:
        f1 = 0.0
    return f1

def generate_metrics_dict(model_name, mAP50, mAP50_95, precision, recall, f1_score, class_name=None, model_type=None):
    metrics = {
        'model_name': model_name,
        'mAP50': float(mAP50) if mAP50 is not None else 0.0,
        'mAP50-95': float(mAP50_95) if mAP50_95 is not None else 0.0,
        'precision': float(precision) if precision is not None else 0.0,
        'recall': float(recall) if recall is not None else 0.0,
        'f1_score': float(f1_score)
    }

    if class_name is not None:
        metrics['class_name'] = class_name

    if model_type is not None:
        metrics['model_type'] = model_type

    return metrics