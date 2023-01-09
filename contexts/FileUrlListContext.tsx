// Lookup table for file URLs of team logos and avatars of tesam members.
import { createContext } from "react";

// Sample data of FileUrlList.
// const fileUrlList = {
//   teamLogoUrlList: {
//     "1": "https://cdn.discordapp.com/attachments/888888888888888888/888888888888888888/888888888888888888.png",
//     "2": "https://cdn.discordapp.com/attachments/888888888888888888/888888888888888888/888888888888888888.png",
//   },
//   avatarUrlList: {
//     "1": "https://cdn.discordapp.com/attachments/888888888888888888/888888888888888888/888888888888888888.png",
//     "2": "https://cdn.discordapp.com/attachments/888888888888888888/888888888888888888/888888888888888888.png",
//   },
// };

export type FileUrlList = {
  teamLogoUrlList: Record<string, string | null>;
  avatarUrlList: Record<string, string | null>;
};

const FileUrlListContext = createContext<FileUrlList>({
  teamLogoUrlList: {},
  avatarUrlList: {},
});

export default FileUrlListContext;
