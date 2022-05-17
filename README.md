# interactive-music-search

An interactive search application for audio and symbol music features.

## setup

copy sample environment file

```shell
cp server/environment.json.sample server/environment.json
cp web_interface/.env-sample web_interface/.env
```

### Database backend

install dependencies

```shell
cd server/
pip install -r requirements.txt
```

get data

1. get **Meta MIDI Dataset** from Zenodo and set the dataset path
2. get Spotify API credencials and set values

```json
{
    "DATASET_PATH": "YOUR_DATASET_DIR_PATH (end with 'meta_midi_dataset/')",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET"
}
```

create dataset

```shell
python create_database.py -n 1000
```

run server

```shell
python run.py YOUR_PORT_NUM
```

### Web Interface

install dependencies and generate static sites with Nextjs

```shell
cd web_interface/
npm install yarn # if you need
yarn install
```

set your backend environment on `.env` on `web_interface/`

```shell
API_URL="YOUR_HOST_NAME:YOUR_PORT_NUM"
```

generate static site and run webserver

```shell
yarn start
```
