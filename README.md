# interactive-music-search

An interactive search application for audio and symbol music features.

![dea8e83ac50b7e6febdff30f5fe06df0](https://user-images.githubusercontent.com/19545249/185373693-48e6150b-0e7b-422a-ac69-b93849e1283d.gif)
![0348a165e25c43c950595fee043b7e36](https://user-images.githubusercontent.com/19545249/185373820-e1b5ba45-2488-48d7-98b5-860f2fab9468.gif)

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
