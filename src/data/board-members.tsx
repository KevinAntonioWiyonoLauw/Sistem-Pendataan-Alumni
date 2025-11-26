import type { BoardMember } from '@/types/organization'

export const boardMembers: BoardMember[] = [
  {
    id: '1',
    name: 'Satya Nugraha',
    nickname: 'Satya',
    batch: 2011,
    position: 'Ketua',
    role: 'ketua',
  },
  {
    id: '2',
    name: 'Anindito Satrianto',
    nickname: 'Jo',
    batch: 2002,
    position: 'Wakil Ketua 1',
    role: 'wakil',
  },
  {
    id: '3',
    name: 'Raden Bagus Muhammad Adryan Putra Adhy Wijaya',
    nickname: 'Bege',
    batch: 2021,
    position: 'Wakil Ketua 2',
    role: 'wakil',
  },
  {
    id: '4',
    name: 'Putri Mayang Sari',
    nickname: 'Em',
    batch: 2011,
    position: 'Sekretaris 1',
    role: 'sekretaris',
  },
  {
    id: '5',
    name: 'Jan Kristanto Wibisono',
    nickname: 'Jan',
    batch: 2005,
    position: 'Sekretaris 2',
    role: 'sekretaris',
  },
  {
    id: '6',
    name: 'Bety Ria Sersana',
    nickname: undefined,
    batch: 2003,
    position: 'Bendahara 1',
    role: 'bendahara',
  },
  {
    id: '7',
    name: 'Indra Haryadi',
    nickname: 'Indra',
    batch: 2004,
    position: 'Bendahara 2',
    role: 'bendahara',
  },
]

export const getBoardMembersByRole = (role: BoardMember['role']) => {
  return boardMembers.filter((member) => member.role === role)
}

export const getChairperson = () => {
  return boardMembers.find((member) => member.role === 'ketua')
}

export const getViceChairpersons = () => {
  return boardMembers.filter((member) => member.role === 'wakil')
}

export const getSecretaries = () => {
  return boardMembers.filter((member) => member.role === 'sekretaris')
}

export const getTreasurers = () => {
  return boardMembers.filter((member) => member.role === 'bendahara')
}
