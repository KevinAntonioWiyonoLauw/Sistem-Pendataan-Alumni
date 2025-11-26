export interface BoardMember {
  id: string
  name: string
  nickname?: string
  batch: number
  position: string
  role: 'ketua' | 'wakil' | 'sekretaris' | 'bendahara'
  photo?: string
  linkedin?: string
}

export interface BoardSection {
  title: string
  members: BoardMember[]
}
