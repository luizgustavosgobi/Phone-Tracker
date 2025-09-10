import os.path

import numpy as np
import pandas as pd
from matplotlib import pyplot as plt

PLOT_OUTPUT_DIR = 'plots'

def create_performance_plots(df):
    plt.style.use('seaborn-v0_8')

    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle('Comparação de Desempenho dos Modelos YOLO', fontsize=16, fontweight='bold')

    metrics = ['mAP50', 'mAP50-95', 'precision', 'recall', 'f1_score']
    colors = plt.cm.Set3(np.linspace(0, 1, len(df)))

    axes[0, 0].bar(df['model_name'], df['mAP50'], color=colors)
    axes[0, 0].set_title('mAP@0.5')
    axes[0, 0].set_ylabel('Score')
    axes[0, 0].tick_params(axis='x', rotation=45)

    axes[0, 1].bar(df['model_name'], df['mAP50-95'], color=colors)
    axes[0, 1].set_title('mAP@0.5:0.95')
    axes[0, 1].set_ylabel('Score')
    axes[0, 1].tick_params(axis='x', rotation=45)

    axes[0, 2].bar(df['model_name'], df['precision'], color=colors)
    axes[0, 2].set_title('Precisão')
    axes[0, 2].set_ylabel('Score')
    axes[0, 2].tick_params(axis='x', rotation=45)

    axes[1, 0].bar(df['model_name'], df['recall'], color=colors)
    axes[1, 0].set_title('Recall')
    axes[1, 0].set_ylabel('Score')
    axes[1, 0].tick_params(axis='x', rotation=45)

    axes[1, 1].bar(df['model_name'], df['f1_score'], color=colors)
    axes[1, 1].set_title('F1-Score')
    axes[1, 1].set_ylabel('Score')
    axes[1, 1].tick_params(axis='x', rotation=45)

    ax_radar = axes[1, 2]
    angles = np.linspace(0, 2 * np.pi, len(metrics), endpoint=False)
    angles = np.concatenate((angles, [angles[0]]))

    for i, row in df.iterrows():
        values = [row[metric] for metric in metrics]
        values += [values[0]]

        ax_radar.plot(angles, values, 'o-', linewidth=2, label=row['model_name'])
        ax_radar.fill(angles, values, alpha=0.25)

    ax_radar.set_xticks(angles[:-1])
    ax_radar.set_xticklabels(metrics)
    ax_radar.set_ylim(0, 1)
    ax_radar.set_title('Comparação Radar')
    ax_radar.legend(loc='upper right', bbox_to_anchor=(1.3, 1.0))
    ax_radar.grid(True)

    plt.tight_layout()
    plt.savefig(os.path.join(PLOT_OUTPUT_DIR,'models_performance.png'), dpi=300, bbox_inches='tight')
    plt.show()

def create_ranking_plot(df):
    df['overall_score'] = (df['mAP50'] * 0.3 + df['mAP50-95'] * 0.3 +
                           df['precision'] * 0.15 + df['recall'] * 0.15 +
                           df['f1_score'] * 0.1)

    df_sorted = df.sort_values('overall_score', ascending=True)

    plt.figure(figsize=(12, 8))
    bars = plt.barh(df_sorted['model_name'], df_sorted['overall_score'],
                    color=plt.cm.viridis(np.linspace(0, 1, len(df_sorted))))

    plt.xlabel('Score Geral Ponderado')
    plt.title('Ranking Geral dos Modelos YOLO')
    plt.grid(axis='x', alpha=0.3)

    for bar in bars:
        width = bar.get_width()
        plt.text(width + 0.01, bar.get_y() + bar.get_height() / 2,
                 f'{width:.3f}', ha='left', va='center')

    plt.tight_layout()
    plt.savefig(os.path.join(PLOT_OUTPUT_DIR, 'models_ranking.png'), dpi=300, bbox_inches='tight')
    plt.show()

#
# Cria gráficos comparando performance por classe entre modelos
#

def create_class_performance_plots(results_data_per_class):

    if not results_data_per_class:
        print("Nenhum dado de performance por classe disponível")
        return

    df_classes = pd.DataFrame(results_data_per_class)

    all_classes = df_classes['class_name'].unique()
    all_models = df_classes['model_name'].unique()

    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('Comparação de Performance por Classe entre Modelos', fontsize=16, fontweight='bold')

    metrics = ['precision', 'recall', 'mAP50', 'f1_score']
    titles = ['Precisão por Classe', 'Recall por Classe', 'mAP@0.5 por Classe', 'F1-Score por Classe']

    x = np.arange(len(all_classes))
    width = 0.8 / len(all_models)
    colors = plt.cm.tab10(np.linspace(0, 1, len(all_models)))

    for idx, (metric, title) in enumerate(zip(metrics, titles)):
        row, col = divmod(idx, 2)
        ax = axes[row, col]

        for i, model in enumerate(all_models):
            model_data = df_classes[df_classes['model_name'] == model]

            values = []
            for class_name in all_classes:
                class_data = model_data[model_data['class_name'] == class_name]
                if not class_data.empty:
                    values.append(class_data[metric].iloc[0])
                else:
                    values.append(0.0)

            bars = ax.bar(x + i * width, values, width, label=model, color=colors[i], alpha=0.8)

            for bar, value in zip(bars, values):
                if value > 0:
                    ax.text(bar.get_x() + bar.get_width() / 2, bar.get_height() + 0.01,
                            f'{value:.2f}', ha='center', va='bottom', fontsize=8)

        ax.set_xlabel('Classes')
        ax.set_ylabel(metric.title())
        ax.set_title(title)
        ax.set_xticks(x + width * (len(all_models) - 1) / 2)
        ax.set_xticklabels(all_classes, rotation=45, ha='right')
        ax.legend()
        ax.grid(axis='y', alpha=0.3)
        ax.set_ylim(0, 1.1)

    plt.tight_layout()
    plt.savefig(os.path.join(PLOT_OUTPUT_DIR,'models_class_performance.png'), dpi=300, bbox_inches='tight')
    plt.show()

#
# Cria heatmap de performance por classe
#

def create_performance_heatmap(results_data_per_class):
    df_classes = pd.DataFrame(results_data_per_class)

    all_classes = df_classes['class_name'].unique()
    all_models = df_classes['model_name'].unique()

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('Heatmap de Performance por Classe', fontsize=16, fontweight='bold')

    metrics = ['precision', 'recall', 'mAP50', 'f1_score']
    titles = ['Precisão', 'Recall', 'mAP@0.5', 'F1-Score']

    for idx, (metric, title) in enumerate(zip(metrics, titles)):
        row, col = divmod(idx, 2)
        ax = axes[row, col]

        performance_matrix = np.zeros((len(all_models), len(all_classes)))

        for i, model in enumerate(all_models):
            for j, class_name in enumerate(all_classes):
                model_class_data = df_classes[
                    (df_classes['model_name'] == model) &
                    (df_classes['class_name'] == class_name)
                    ]
                if not model_class_data.empty:
                    performance_matrix[i, j] = model_class_data[metric].iloc[0]

        im = ax.imshow(performance_matrix, cmap='RdYlGn', aspect='auto', vmin=0, vmax=1)

        ax.set_xticks(range(len(all_classes)))
        ax.set_yticks(range(len(all_models)))
        ax.set_xticklabels(all_classes, rotation=45, ha='right')
        ax.set_yticklabels(all_models)
        ax.set_title(title)
        ax.grid(False)

        for i in range(len(all_models)):
            for j in range(len(all_classes)):
                value = performance_matrix[i, j]
                if value > 0:
                    ax.text(j, i, f'{value:.2f}', ha='center', va='center',
                            color='white' if value < 0.5 else 'black', fontweight='bold')

        plt.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

    plt.tight_layout()
    plt.savefig(os.path.join(PLOT_OUTPUT_DIR,'models_class_heatmap.png'), dpi=300, bbox_inches='tight')
    plt.show()

#
# Cria gráficos comparando YOLO e RF-DETR
#

def create_mixed_performance_plots(df):
    plt.style.use('seaborn-v0_8')

    fig, axes = plt.subplots(2, 3, figsize=(18, 12))
    fig.suptitle('Comparação YOLO vs RF-DETR', fontsize=16, fontweight='bold')

    yolo_data = df[df['model_type'] == 'YOLO']
    detr_data = df[df['model_type'] == 'RF-DETR']

    metrics = ['mAP50', 'mAP50-95', 'precision', 'recall', 'f1_score']

    for idx, metric in enumerate(metrics):
        row, col = divmod(idx, 3)
        ax = axes[row, col]

        if not yolo_data.empty and metric in yolo_data.columns:
            ax.bar(yolo_data['model_name'], yolo_data[metric],
                   alpha=0.7, label='YOLO', color='blue')

        if not detr_data.empty and metric in detr_data.columns:
            ax.bar(detr_data['model_name'], detr_data[metric],
                   alpha=0.7, label='RF-DETR', color='red')

        ax.set_title(metric)
        ax.set_ylabel('Score')
        ax.tick_params(axis='x', rotation=45)
        ax.legend()
        ax.grid(axis='y', alpha=0.3)

    plt.tight_layout()
    plt.savefig(os.path.join(PLOT_OUTPUT_DIR,'yolo_vs_detr.png'), dpi=300, bbox_inches='tight')
    plt.show()