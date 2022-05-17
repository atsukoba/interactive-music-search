import os
from typing import Dict, List, Optional, TypedDict, Union

from flask import Flask, jsonify, make_response, request

from src.sample_data import get_sample_n_data
from src.utils import create_logger, env


class RequestType(TypedDict):
    features_name: Optional[List[str]]
    n_songs: int


logger = create_logger(os.path.basename(__file__))

app = Flask(__name__)


@app.route("/", methods=["GET"])
def test():
    return jsonify({
        "data": "Hello!"
    })


@app.route("/parrot", methods=["POST"])
def parrot():
    return jsonify(request.get_data())


@app.route("/get_features_sample", methods=["POST"])
def sample():
    req_json: Optional[RequestType] = request.get_json()  # Get POST JSON
    if req_json:
        return jsonify(get_sample_n_data(req_json["n_songs"]))


@app.route("/get_features", methods=["POST"])
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


def get_features():
    req_json = request.get_json()  # Get POST JSON
    if req_json is None:
        logger.warn("request body is empty")
        return jsonify({})
    logger.debug(f"request: {req_json}")
    NAME = req_json["name"]
    result = {
        "data": {
            "id": 1,
            "name": NAME
        }
    }
    return jsonify(result)
