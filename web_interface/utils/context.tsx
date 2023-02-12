import { createContext, useEffect, useState } from "react";
import { ResponseDatum } from "../api/data";


interface DataContextType {
  data: Array<ResponseDatum>;
  sidMapping: Map<string, string>;
}
export const DataContext = createContext<DataContextType>({
  data: [],
  sidMapping: new Map<string, string>(),
});

export interface UploadedSongContextDataType {
  title: string;
  serverFileName: string;
}

export interface UploadedSongContextType {
  userSongData: Array<UploadedSongContextDataType>;
  setUserSongData: (any) => void;
  selectedUserSong: {},
  setSelectedUserSong: (any) => void
}
export const UserSongsContext = createContext<UploadedSongContextType>({
  userSongData: [],
  setUserSongData: () => { },
  selectedUserSong: {},
  setSelectedUserSong: () => { }
});

export const UserSongsContextProvider = ({ children }) => {
  // global state
  const [userSongData, setUserSongData] = useState([])
  const [selectedUserSong, setSelectedUserSong] = useState({})

  useEffect(() => {
    const stored: Array<UploadedSongContextDataType> = JSON.parse(
      localStorage.getItem("userSongData"))
    if (stored && stored.length > 0) {
      console.log("restoring global state from localStorage.userSongData");
      console.dir(stored);
      setUserSongData(userSongData => [...userSongData, ...stored])
      const selected = {}
      stored.forEach(d => {
        selected[d.title] = true
      })
      setSelectedUserSong({
        ...selectedUserSong,
        ...selected
      })
    }
  }, [setUserSongData])

  return (
    <UserSongsContext.Provider value={{
      userSongData, setUserSongData, selectedUserSong, setSelectedUserSong
    }}>
      {children}
    </UserSongsContext.Provider>
  )
}