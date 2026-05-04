export   interface directorType {
  civility?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: number;
  country: string;
  birthday: Date;
  address: string;
}
export    interface movieType {
  original_title: string;
  english_title: string;
  youtube_url?: string;
  ishybrid: boolean;
  language: string;
  english_synopsis: string;
  original_synopsis: string;
  creative_process?: string;
  english_creative_process?: string;
  ia_tools?: string;
  hassubs?: boolean;
  director_id: number;
  images: string[];
  duration: number;
  tags: string;
}

export    interface Collaborator {
  firstname: string;
  lastname: string;
  email: string;
  job: string;
  contribution: string;
}