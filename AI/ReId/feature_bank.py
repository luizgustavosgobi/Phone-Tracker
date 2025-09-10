import numpy as np
from scipy.spatial.distance import cosine


class FeatureBank:
    """Armazena features históricas para reidentificação"""

    def __init__(self, max_features_per_id: int = 10, similarity_threshold: float = 0.6):
        self.feature_bank = {}  # {tracker_id: [features]}
        self.max_features_per_id = max_features_per_id
        self.similarity_threshold = similarity_threshold

    def add_feature(self, tracker_id: int, feature: np.ndarray):
        """Adiciona uma feature ao banco"""
        if tracker_id not in self.feature_bank:
            self.feature_bank[tracker_id] = []

        self.feature_bank[tracker_id].append(feature)

        # Manter apenas as últimas N features
        if len(self.feature_bank[tracker_id]) > self.max_features_per_id:
            self.feature_bank[tracker_id].pop(0)

    def find_best_match(self, query_feature: np.ndarray) -> tuple[int, float]:
        """Encontra o melhor match no banco de features"""
        best_id = -1
        best_similarity = float('inf')

        for tracker_id, features in self.feature_bank.items():
            # Calcular similaridade média com todas as features do ID
            similarities = [
                cosine(query_feature, stored_feature)
                for stored_feature in features
            ]
            avg_similarity = np.mean(similarities)

            if avg_similarity < best_similarity and avg_similarity < self.similarity_threshold:
                best_similarity = avg_similarity
                best_id = tracker_id

        return best_id, best_similarity