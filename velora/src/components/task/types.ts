export type Creator = {
  name: string;
  followers: string;
  avatar: string;
};

export type VideoInfo = {
  title: string;
  views: string;
  heroImage: string;
  description: string;
  creator: Creator;
};

export type Comment = {
  id: string | number;
  name: string;
  time: string;
  avatar: string;
  text: string;
};
