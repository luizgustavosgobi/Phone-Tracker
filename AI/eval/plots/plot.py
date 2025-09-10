import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load the dataset
results_df = pd.read_csv('us/model_evaluation_results.csv')
results_df2 = pd.read_csv('us/model_evaluation_per_class.csv')

def makeDispersionGraph(results_df):
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(12, 10))

    sns.scatterplot(x='precision', y='recall', hue='model_type', data=results_df, s=150, ax=ax, palette='deep')

    for i in range(results_df.shape[0]):
        plt.text(x=results_df.precision[i] + 0.005, y=results_df.recall[i], s=results_df.model_name[i],
                 fontdict=dict(color='black', size=10))

    ax.set_title('Gráfico de Dispersão: Precisão vs. Recall', fontsize=16)
    ax.set_xlabel('Precisão (Precision)', fontsize=12)
    ax.set_ylabel('Recall', fontsize=12)
    plt.legend(title='Tipo de Modelo')
    plt.tight_layout()
    plt.savefig('dispersao_precision_recall.png')
    plt.show()
    plt.clf()

def create_performance_heatmap(results_df):
    df_classes = pd.DataFrame(results_df)

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
    plt.savefig('models_class_heatmap.png')
    plt.show()


makeDispersionGraph(results_df)
create_performance_heatmap(results_df2)