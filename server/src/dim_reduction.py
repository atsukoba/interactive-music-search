import os
from typing import Any, Callable, List, Optional, Tuple

import networkx as nx
import numpy as np
import pandas as pd
import scipy
from networkx import Graph
from scipy.spatial.distance import pdist, squareform
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE, _utils
from sklearn.metrics import pairwise_distances

from src.utils import create_logger

logger = create_logger(os.path.basename(__file__))


def dim_reduction_pca(data: np.ndarray) -> np.ndarray:
    logger.debug(f"input data dimentions: {data.shape}")
    data_pca = PCA(n_components=3).fit_transform(data)
    logger.debug(f"PCA data dimentions: {data_pca.shape}")
    return data_pca


def dim_reduction_tsne(data: np.ndarray) -> np.ndarray:
    logger.debug(f"input data dimentions: {data.shape}")
    data_tsne = TSNE(n_components=3, n_iter=500, n_jobs=-1).fit_transform(data)
    logger.debug(f"t-SNE data dimentions: {data_tsne.shape}")
    return data_tsne


def dim_reduction_htsne(data: np.ndarray) -> np.ndarray:
    logger.debug(f"input data dimentions: {data.shape}")
    data_tsne = TSNE(n_components=3).fit_transform(data)
    logger.debug(f"ht-SNE data dimentions: {data_tsne.shape}")
    return data_tsne


class HTSNE:
    """ Hieralchical t-SNE
    original source: <https://github.com/Cobanoglu-Lab/h-tSNE/blob/master/HTSNE.py>

        Base TSNE code is based on the below source & the sklearn.manifold implementation.
        ref: https://towardsdatascience.com/t-sne-python-example-1ded9953f26
    """

    def __init__(self, graph_labels: List[str], aj_matrix: np.ndarray):
        """_summary_

        Args:
            graph_labels (List[str]): list of feature names
            aj_matrix (np.ndarray): on-hot encoded dependencies among features

        >>> #Input Hierarchy Adjacency Matrix
        >>> input_labels = ["Lymphoid", "Myeloid", "T Cells", "CD4 T", "Conventional T",
        >>>                 "Effector/Memory T", "CD8+ Cytotoxic T", "CD8+/CD45RA+ Naive Cytotoxic", "CD4+/CD25 T Reg", "CD19+ B",
        >>>                 "CD4+/CD45RO+ Memory", "Dendritic", "CD56+ NK", "CD34+", "CD4+/CD45RA+/CD25- Naive T",
        >>>                 "CD14+ Monocyte", "CD4+ T Helper2"]
        >>> aj_matrix = np.zeros(shape=(len(input_labels),len(input_labels)))
        >>> aj_matrix[13] =[1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0] # 13 to 0 and 1
        >>> aj_matrix[0] = [0,0,1,0,0,0,0,0,0,1,0,0,1,0,0,0,0] # 0 to 2 and 9
        >>> aj_matrix[1] = [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0] # 1 to 11 and 15
        >>> aj_matrix[2] = [0,0,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0] # 2 to 3 and 6
        >>> aj_matrix[3] = [0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0] # 3 to 4 and 8
        >>> aj_matrix[4] = [0,0,0,0,0,1,0,0,0,0,0,0,0,0,1,0,0] # 4 to 14 5
        >>> aj_matrix[5] = [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1] # 5 to 16 and 10
        >>> aj_matrix[6] = [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0] # 6 to 7
        >>> # Run HTSNE
        >>> ncols=submatrix.shape[0]
        >>> htsne = HTSNE(input_labels, aj_matrix)
        >>> X_embedded = htsne.fit(submatrix, labels[0:ncols],factor=.25,random=True,n_iterations=1000)
        """
        self.MACHINE_EPSILON = np.finfo(np.double).eps  # 1.0 + eps != 1.0
        self.n_components = 3  # 2D
        self.perplexity = 30  # Number of local neighbors.
        self.N_ITER = 1000
        self.X_embedded = None
        self.labels = pd.DataFrame([])
        self.labeldict = {}
        self.graph: Optional[Graph] = None
        self.max_shortestpath = 0
        self._init_graph(graph_labels, aj_matrix)

    def _init_graph(self, graph_labels, aj_matrix):
        # Dictionary from labels:
        cnt = 0
        for label in graph_labels:
            #print(str(cnt) + " " + label);
            self.labeldict[label] = cnt
            cnt += 1

        # Make graph & find maximum shortest path:
        self.graph = nx.from_numpy_matrix(aj_matrix)
        for i in range(self.graph.size()):
            for j in range(self.graph.size()):
                path_len = nx.shortest_path_length(self.graph, i, j)
                if path_len > self.max_shortestpath:
                    self.max_shortestpath = path_len

    def show_graph_info(self):
        cnt = 0
        glabels = {}
        for label in self.labeldict:
            glabels[cnt] = str(cnt)
            print("%d: %s" % (cnt, label))
            cnt += 1
        nx.draw(self.graph, labels=glabels)

    def fit(self, X: np.ndarray, xlabels: pd.DataFrame, factor: int, random=True,
            n_iterations: Optional[int] = None, transpose=True, X_embedded=None) -> np.ndarray:
        """_summary_

        Args:
            X (np.ndarray): _description_
            xlabels (pd.DataFrame): _description_
            factor (int): _description_
            random (bool, optional): _description_. Defaults to True.
            n_iterations (Optional[int], optional): _description_. Defaults to None.
            transpose (bool, optional): _description_. Defaults to True.
            X_embedded (_type_, optional): _description_. Defaults to None.

        Returns:
            _type_: _description_

        >>> X_embedded = htsne.fit(submatrix, labels[0:ncols], factor=.25, random=True, n_iterations=1000)
        """
        if n_iterations == None:
            n_iterations = self.N_ITER
        self.N_ITER = n_iterations

        if transpose:
            X = X.transpose()  # KEVIN
        n_samples = X.shape[0]

        self.labels = xlabels

        # Compute euclidean distance
        distances = pairwise_distances(X, metric="euclidean", squared=True)
        pathpairwise = self.path_pairwise(X, factor)  # .15
        np.fill_diagonal(pathpairwise, 0)
        distances = np.multiply(distances, pathpairwise)

        # Normalize distances
        distances = (distances-distances.min()) / \
            (distances.max()-distances.min())
        # distances=(distances-distances.mean())/distances.std()

        # Compute joint probabilities p_ij from distances.
        P = self._joint_probabilities(
            distances=distances, desired_perplexity=self.perplexity, verbose=False)

        # The embedding is initialized with iid samples from Gaussians with standard deviation 1e-4.
        # KEVIN: modify to include what we know as meaningful samples? (at nodes of tree).
        if random == True:
            self.X_embedded = 1e-4 * \
                np.random.randn(
                    n_samples, self.n_components).astype(np.float32)
        else:
            self.X_embedded = X_embedded

        degrees_of_freedom = max(self.n_components - 1, 1)

        return self._tsne(P, degrees_of_freedom, n_samples, X_embedded=self.X_embedded)

    def path_dist(self, label1: int, label2: int):
        i = self.labeldict.get(self.labels.values[label1][0])
        j = self.labeldict.get(self.labels.values[label2][0])
        # -2 is common to all graphs so siblings have a zero weight
        return (nx.shortest_path_length(self.graph, i, j)-1)/8

    def path_pairwise(self, x, factor=1, squared=True):
        dists = np.zeros((x.shape[0], x.shape[1]))
        for i, row_x in enumerate(x):     # loops over rows of `x`
            for j, row_y in enumerate(x):  # loops over rows of `y`
                dists[i, j] = (1 - factor) + self.path_dist(i, j) * factor
        return dists

    def _joint_probabilities(self, distances, desired_perplexity, verbose):
        # Compute conditional probabilities such that they approximately match the desired perplexity
        distances = distances.astype(np.float32, copy=False)
        conditional_P = _utils._binary_search_perplexity(
            distances, desired_perplexity, verbose)
        P = conditional_P + conditional_P.T
        sum_P = np.maximum(np.sum(P), self.MACHINE_EPSILON)
        P = np.maximum(squareform(P) / sum_P, self.MACHINE_EPSILON)
        return P

    def _gradient_descent(self, obj_func: Callable, p0: np.ndarray, args: List[Any],
                          it=0, n_iter=None, n_iter_check=1, n_iter_without_progress=300,
                          momentum=0.8, learning_rate=200.0, min_gain=0.01, min_grad_norm=1e-7):
        """

        Args:
            obj_func (Callable): _description_
            p0 (np.ndarray): _description_
            args (dict): _description_
            it (int, optional): _description_. Defaults to 0.
            n_iter (_type_, optional): _description_. Defaults to None.
            n_iter_check (int, optional): _description_. Defaults to 1.
            n_iter_without_progress (int, optional): _description_. Defaults to 300.
            momentum (float, optional): _description_. Defaults to 0.8.
            learning_rate (float, optional): _description_. Defaults to 200.0.
            min_gain (float, optional): _description_. Defaults to 0.01.
            min_grad_norm (_type_, optional): _description_. Defaults to 1e-7.

        Returns:
            _type_: _description_
        """
        if n_iter == None:
            n_iter = self.N_ITER

        p = p0.copy().ravel()
        update = np.zeros_like(p)
        gains = np.ones_like(p)
        error = np.finfo(np.float16).max
        best_error = np.finfo(np.float16).max
        best_iter = i = it

        for i in range(it, n_iter):
            error, grad = obj_func(p, *args)
            grad_norm = scipy.linalg.norm(grad)  # type: ignore
            inc = update * grad < 0.0
            dec = np.invert(inc)
            gains[inc] += 0.2
            gains[dec] *= 0.8
            np.clip(gains, min_gain, np.inf, out=gains)
            grad *= gains
            update = momentum * update - learning_rate * grad
            p += update
            #print("[t-SNE] Iteration %d: error = %.7f, gradient norm = %.7f" % (i + 1, error, grad_norm))
            if error < best_error:
                best_error = error
                best_iter = i
            elif i - best_iter > n_iter_without_progress:
                print("Early stopping " + str(i))
                break

            if grad_norm <= min_grad_norm:
                print("Grad norm " + str(i))
                break
        return p

    def _kl_divergence(self, params: np.ndarray, P: np.ndarray,
                       degrees_of_freedom: int, n_samples: int,
                       n_components: int) -> Tuple[np.ndarray, np.ndarray]:
        if n_components == None:
            n_components = self.n_components

        self.X_embedded = params.reshape(n_samples, n_components)

        dist = pdist(self.X_embedded, "sqeuclidean")
        dist /= degrees_of_freedom
        dist += 1.
        dist **= (degrees_of_freedom + 1.0) / -2.0
        Q = np.maximum(dist / (2.0 * np.sum(dist)), self.MACHINE_EPSILON)

        # Kullback-Leibler divergence of P and Q
        kl_divergence = 2.0 * \
            np.dot(P, np.log(np.maximum(P, self.MACHINE_EPSILON) / Q))

        # Gradient: dC/dY
        grad = np.ndarray((n_samples, n_components), dtype=params.dtype)
        PQd = squareform((P - Q) * dist)
        for i in range(n_samples):
            grad[i] = np.dot(np.ravel(PQd[i], order="K"),
                             self.X_embedded[i] - self.X_embedded)
        grad = grad.ravel()
        c = 2.0 * (degrees_of_freedom + 1.0) / degrees_of_freedom
        grad *= c
        return kl_divergence, grad

    def _tsne(self, P, degrees_of_freedom, n_samples, X_embedded):
        params = X_embedded.ravel()
        obj_func = self._kl_divergence
        params = self._gradient_descent(
            obj_func, params, [P, degrees_of_freedom, n_samples, self.n_components])
        X_embedded = params.reshape(n_samples, self.n_components)
        return X_embedded
