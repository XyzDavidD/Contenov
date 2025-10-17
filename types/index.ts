export interface Brief {
  id: string;
  title: string;
  keyword: string;
  createdAt: Date;
  status: 'draft' | 'completed';
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'starter' | 'agency';
}






