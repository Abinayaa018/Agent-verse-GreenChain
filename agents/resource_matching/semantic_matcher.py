"""TF-IDF character n-gram semantic matcher — fit on KB at load time."""

from __future__ import annotations
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from .models import IndustryMatch
from .knowledge_base import KnowledgeBase, _default_kb


class SemanticMatcher:
    """
    Fit a TF-IDF model over all material_keyword strings in the KB.
    Character n-grams (2-4) handle plural/reordered variants automatically.
    Swap path to embeddings + vector DB: keep fit()/find_similar() signatures.
    """

    def __init__(self, kb: KnowledgeBase = _default_kb):
        self._kb = kb
        self._vectorizer = TfidfVectorizer(analyzer="char_wb", ngram_range=(2, 4))
        self._entries: list[IndustryMatch] = []
        self._matrix = None
        self.fit()

    def fit(self) -> None:
        self._entries = self._kb.all_entries()
        keywords = [e.material_keyword.lower() for e in self._entries]
        if keywords:
            self._matrix = self._vectorizer.fit_transform(keywords)

    def find_similar(self, material_name: str, top_k: int = 10, threshold: float = 0.15) -> list[IndustryMatch]:
        if self._matrix is None or not self._entries:
            return []

        query_vec = self._vectorizer.transform([material_name.lower()])
        scores = cosine_similarity(query_vec, self._matrix).flatten()

        seen: set[str] = set()
        results: list[IndustryMatch] = []
        for idx in np.argsort(scores)[::-1]:
            if scores[idx] < threshold:
                break
            entry = self._entries[idx]
            if entry.industry_name not in seen:
                results.append(entry)
                seen.add(entry.industry_name)
            if len(results) >= top_k:
                break

        return results
