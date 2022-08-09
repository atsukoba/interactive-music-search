import os
from typing import Dict, List, Optional, TypedDict, Union

from flask import Flask, jsonify, make_response, request
from flask_cors import CORS

from src.data import get_sample_n_data, get_n_data
from src.utils import create_logger, env


class RequestType(TypedDict):
    features_name: Optional[List[str]]
    n_songs: int


logger = create_logger(os.path.basename(__file__))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # insecure ?


@app.route("/", methods=["GET"])
def test():
    return jsonify({
        "data": "Hello!"
    })


@app.route("/parrot", methods=["POST"])
def parrot():
    return jsonify(request.get_data())


@app.route("/user_data", methods=["POST"])
def user_data():
    data = request.get_data()
    logger.info(data)


@app.route("/get_features_sample", methods=['GET', 'POST'])
def get_features_sample():
    req_json: Optional[RequestType] = request.get_json(
        force=True)  # Get POST JSON
    logger.info(req_json)
    if req_json:
        return jsonify(get_sample_n_data(req_json["n_songs"]))


def get_3d_features():
    req_json: Optional[RequestType] = request.get_json()  # Get POST JSON
    if req_json is None:
        logger.warn("request body is empty")
        return jsonify({})
    logger.debug(f"request: {req_json}")
    names = req_json["features_name"]
    if names is None:
        return jsonify({})
    logger.debug(f"Request features: {names}")

    if len(names) > 3:
        # TODO: Do somethong here
        # shurink dimension
        result = {
            "data": {
                "id": 1,
                "name": "Hoge"
            }
        }
    else:
        # TODO: Do somethong here
        # return allthe values
        result = {
            "data": {
                "id": 1,
                "name": "Fuga"
            }
        }
    return jsonify(result)


@app.route("/get_features", methods=["POST"])
def get_features():
    """ request/response body

    Request:
    {
        'feature_names': [
            'pitch_range', 'n_pitches_used', 'n_pitch_classes_used', 'polyphony',
            'polyphony_rate', 'scale_consistency', 'pitch_entropy', 
            'pitch_class_entropy', 'empty_beat_rate'
        ],
        'method': "PCA",
        'n_songs': 100
    }
    Returns:
        _type_: _description_
    """
    req_json = request.get_json(force=True)  # Get POST JSON
    if req_json is None:
        logger.warn("request body is empty")
        return jsonify({'message': 'request error'}), 500
    logger.debug(f"request: {req_json}")
    res = get_n_data(req_json["feature_names"],
                     n=req_json["n_songs"],
                     dim_reduction_method=req_json["method"])
    if res is None:
        return jsonify({'message': 'db error'}), 500
    return jsonify(res)


if __name__ == "__main__":
    pass
