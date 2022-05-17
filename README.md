# interactive-music-search

An interactive search application for audio and symbol music features.

## Database backend

install dependencies

```shell
cd server/
pip install -r requirements.txt
```

get **Meta MIDI Dataset** from Zenodo and set the dataset path to `.env` on `server/`

```shell
# .env
DATABASE_PATH="~/datasets/meta_midi_dataset"
```

get Spotify API credencials and set values to `.env` on `server/`

```shell
# .env
client_id="CLIENT_ID"
client_secret="CLIENT_SECRET"
```

create dataset

```shell
python create_database.py -n 1000
```

run server

```shell
python run.py YOUR_PORT_NUM
```

## Web Interface

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
