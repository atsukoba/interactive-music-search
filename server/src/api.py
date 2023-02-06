from datetime import datetime
import os
from typing import Dict, List, Literal, Optional, TypedDict, Union

from flask import Flask, jsonify, make_response, request
from flask_cors import CORS

from src.data import get_n_data, get_sample_n_data
from src.utils import create_logger, env


class RequestType(TypedDict):
    features_name: Optional[List[str]]
    n_songs: int


logger = create_logger(os.path.basename(__file__))

app = Flask(__name__)
cors = CORS(
    app, resources={
        r"/*": {"origins": [
            "http://cclab-dlbox2.sfc.keio.ac.jp",
            "http://cclab-dlbox2.sfc.keio.ac.jp:3000",
            "http://localhost:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3000"
            "http://127.0.0.1:3001"
        ]}})


@app.route("/", methods=["GET"])
def test():
    return jsonify({
        "data": "Hello!"
    })


@app.route("/parrot", methods=["POST"])
def parrot():
    return jsonify(request.get_data())


UploadFileType = Literal["audio", "midi"]


@app.route("/user_data/audio", methods=["POST"])
def user_data_audio():
    files = request.files
    logger.info(request)
    logger.info(request.files)
    file_name = datetime.now().strftime("%Y%m%d-%H%M%S.mp3")
    file = files.get('file')
    if file:
        logger.info(file)
        with open(os.path.abspath(f'{os.path.abspath(__file__)}/../../uploads/audio/{file_name}'), 'wb') as f:
            file.save(f)
            # f.write(file)
        res = jsonify({"fileName": file_name})
        res.headers.add('Access-Control-Allow-Origin', '*')
        return res


@app.route("/user_data/midi", methods=["POST"])
def user_data_midi():
    files = request.files
    file = files.get('file')
    if file:
        logger.info(file.content)
        with open(os.path.abspath(f'{os.path.abspath(__file__)}/../uploads/midi/{file}'), 'wb') as f:
            f.write(file.content)
        res = jsonify({"fileName": file})
        res.headers.add('Access-Control-Allow-Origin', '*')
        return res


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
        'n_songs': 100,
        'genres': [
            'rock', 'pops'
        ],
        'year_range' [1990, 2005]
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
                     n_data=req_json["n_songs"],
                     dim_reduction_method=req_json["method"])
    if res is None:
        return jsonify({'message': 'db error'}), 500
    return jsonify(res)


if __name__ == "__main__":
    pass
