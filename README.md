# interactive-music-search

An interactive search application for audio and symbol music features.

![2140918b7fbc8b8b6052a4f3de939730](https://user-images.githubusercontent.com/19545249/183788680-e0029cb0-e680-48d3-8649-141720acb8b4.gif)
![495b5ff344e31d96dede8eff8e72a2d8](https://user-images.githubusercontent.com/19545249/183788693-444be737-8976-493e-afcc-782cd39c11e4.gif)

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
