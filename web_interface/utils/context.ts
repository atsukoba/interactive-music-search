import { createContext, useState } from "react";
import { ResponseDatum } from "../api/data";


interface DataContextType {
  data: Array<ResponseDatum>;
  sidMapping: Map<string, string>;
}
export const DataContext = createContext<DataContextType>({
  data: [],
  sidMapping: new Map<string, string>(),
});

interface UploadedSongContextDataType {
  title: string;
  serverFileName: string;
}

interface UploadedSongContextType {
  userSongData: Array<UploadedSongContextDataType>;
  setUserSongData: (d: Array<UploadedSongContextDataType>) => void;
}
export const UserSongsContext = createContext<UploadedSongContextType>({
  userSongData: [],
  setUserSongData: () => { }
});
