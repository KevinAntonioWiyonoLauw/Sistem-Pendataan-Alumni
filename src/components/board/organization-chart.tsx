'use client'

import {
  boardMembers,
  getChairperson,
  getViceChairpersons,
  getSecretaries,
  getTreasurers,
} from '@/data/board-members'
import BoardHeader from '@/components/board/board-header'
import BoardSection from '@/components/board/board-section'

export default function OrganizationChart() {
  const chairperson = getChairperson()
  const viceChairpersons = getViceChairpersons()
  const secretaries = getSecretaries()
  const treasurers = getTreasurers()

  return (
    <div className="w-full">
      <BoardHeader />

      {/* Ketua - Featured */}
      {chairperson && (
        <BoardSection
          title="Ketua"
          // description  ="Pimpinan tertinggi organisasi alumni"
          members={[chairperson]}
          variant="featured"
        />
      )}

      {/* Wakil Ketua */}
      <BoardSection
        title="Wakil Ketua"
        // description  ="Membantu ketua dalam menjalankan tugas organisasi"
        members={viceChairpersons}
      />

      {/* Sekretaris */}
      <BoardSection
        title="Sekretaris"
        // description  ="Mengelola administrasi dan dokumentasi organisasi"
        members={secretaries}
      />

      {/* Bendahara */}
      <BoardSection
        title="Bendahara"
        // description  ="Mengelola keuangan dan aset organisasi"
        members={treasurers}
      />
    </div>
  )
}
