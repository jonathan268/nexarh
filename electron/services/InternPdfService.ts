import { getDb } from '../database/connection'
import { interns, companySettings, departments } from '../database/schema'
import { eq } from 'drizzle-orm'
import { BrowserWindow, dialog } from 'electron'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { writeFileSync } from 'fs'

function getInternData(internId: number) {
  const db = getDb()
  const intern = db.select().from(interns).where(eq(interns.id, internId)).get()
  if (!intern) throw new Error('Stagiaire non trouvé')

  let departmentName = ''
  if (intern.departmentId) {
    const dept = db.select().from(departments).where(eq(departments.id, intern.departmentId)).get()
    departmentName = dept?.name || ''
  }

  const settings = db.select().from(companySettings).where(eq(companySettings.id, 1)).get()
  return { intern, settings, departmentName }
}

function generateCertificateHtml(data: {
  intern: any; settings: any; departmentName: string
}): string {
  const { intern, settings, departmentName } = data
  const companyName = settings?.companyName || 'Mon Entreprise'
  const companyCity = (settings?.companyAddress || 'Dakar').split(',')[0].trim() || 'Dakar'

  const dateDebut = format(new Date(intern.startDate), 'dd MMMM yyyy', { locale: fr })
  const dateFin = format(new Date(intern.endDate), 'dd MMMM yyyy', { locale: fr })
  const dateNow = format(new Date(), 'dd MMMM yyyy', { locale: fr })

  const typeLabel = intern.type === 'professionnel' ? 'Stage Professionnel' : 'Stage Académique'
  const dureeMs = new Date(intern.endDate).getTime() - new Date(intern.startDate).getTime()
  const dureeMois = Math.max(1, Math.round(dureeMs / (1000 * 60 * 60 * 24 * 30)))
  const dureeTexte = dureeMois >= 6 ? `${Math.floor(dureeMois / 6)} semestre${Math.floor(dureeMois / 6) > 1 ? 's' : ''}` : `${dureeMois} mois`

  const noteText = intern.evaluationNote != null
    ? `avec la mention ${intern.evaluationNote >= 16 ? 'Très Bien' : intern.evaluationNote >= 14 ? 'Bien' : intern.evaluationNote >= 12 ? 'Assez Bien' : 'Passable'} (note obtenue : ${intern.evaluationNote}/20)`
    : ''

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4 landscape;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #e5e0d6;
      width: 297mm;
      height: 210mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .certificate {
      width: 275mm;
      height: 188mm;
      background: #fcfaf5;
      position: relative;
      overflow: hidden;
      box-shadow: 0 6mm 20mm rgba(0,0,0,0.18);
    }

    /* === BORDURE DOUBLE === */
    .border-outer {
      position: absolute;
      top: 4mm; left: 4mm; right: 4mm; bottom: 4mm;
      border: 1.5px solid #c9a84c;
      pointer-events: none;
      z-index: 8;
    }
    .border-inner {
      position: absolute;
      top: 6mm; left: 6mm; right: 6mm; bottom: 6mm;
      border: 0.5px solid #d4c5a0;
      pointer-events: none;
      z-index: 8;
    }

    /* === BANDES DÉCORATIVES === */
    .stripe-top {
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 7mm;
      background: linear-gradient(90deg, #1e2d4a 0%, #2a4a7a 30%, #c9a84c 50%, #2a4a7a 70%, #1e2d4a 100%);
      z-index: 5;
    }
    .stripe-top-gold {
      position: absolute;
      top: 7mm; left: 0; right: 0;
      height: 1.5mm;
      background: linear-gradient(90deg, transparent, #f0d78c 30%, #c9a84c 50%, #f0d78c 70%, transparent);
      z-index: 5;
    }
    .stripe-bottom {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 7mm;
      background: linear-gradient(90deg, #1e2d4a 0%, #2a4a7a 30%, #c9a84c 50%, #2a4a7a 70%, #1e2d4a 100%);
      z-index: 5;
    }
    .stripe-bottom-gold {
      position: absolute;
      bottom: 7mm; left: 0; right: 0;
      height: 1.5mm;
      background: linear-gradient(90deg, transparent, #f0d78c 30%, #c9a84c 50%, #f0d78c 70%, transparent);
      z-index: 5;
    }

    /* === COINS DÉCORATIFS === */
    .corner { position: absolute; z-index: 6; pointer-events: none; }
    .corner-tl {
      top: 8mm; left: 8mm;
      width: 20mm; height: 20mm;
      border-top: 2px solid #c9a84c;
      border-left: 2px solid #c9a84c;
    }
    .corner-tr {
      top: 8mm; right: 8mm;
      width: 20mm; height: 20mm;
      border-top: 2px solid #c9a84c;
      border-right: 2px solid #c9a84c;
    }
    .corner-bl {
      bottom: 8mm; left: 8mm;
      width: 20mm; height: 20mm;
      border-bottom: 2px solid #c9a84c;
      border-left: 2px solid #c9a84c;
    }
    .corner-br {
      bottom: 8mm; right: 8mm;
      width: 20mm; height: 20mm;
      border-bottom: 2px solid #c9a84c;
      border-right: 2px solid #c9a84c;
    }

    /* === ORNEMENTS GEOMETRIQUES === */
    .geo-circle {
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: 2;
    }
    .gc-1 {
      top: -30mm; right: -20mm;
      width: 80mm; height: 80mm;
      border: 1px solid rgba(201,168,76,0.12);
    }
    .gc-2 {
      bottom: -25mm; left: -15mm;
      width: 60mm; height: 60mm;
      border: 1px solid rgba(201,168,76,0.1);
    }
    .gc-3 {
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      width: 200mm; height: 140mm;
      border: 0.5px solid rgba(201,168,76,0.06);
    }

    /* === CONTENU === */
    .content {
      position: absolute;
      top: 12mm;
      left: 12mm;
      right: 12mm;
      bottom: 12mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      z-index: 7;
      padding: 8mm 20mm;
    }

    .gold-stars {
      color: #c9a84c;
      font-size: 16px;
      letter-spacing: 8px;
      margin-bottom: 2mm;
    }

    .certificate-title {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 32px;
      font-weight: 700;
      color: #1e2d4a;
      text-transform: uppercase;
      letter-spacing: 3px;
      margin-bottom: 1mm;
    }

    .certificate-subtitle {
      font-size: 10px;
      color: #c9a84c;
      text-transform: uppercase;
      letter-spacing: 4px;
      font-weight: 600;
      margin-bottom: 3mm;
    }

    .divider-main {
      width: 70mm;
      height: 0.5mm;
      background: linear-gradient(90deg, transparent, #c9a84c, transparent);
      margin-bottom: 3mm;
    }

    .certify-text {
      font-size: 10px;
      color: #888;
      font-style: italic;
      margin-bottom: 1.5mm;
    }

    .intern-name {
      font-family: 'Times New Roman', Georgia, serif;
      font-size: 28px;
      color: #1e2d4a;
      font-weight: 700;
      letter-spacing: 1px;
      margin-bottom: 1mm;
      text-transform: uppercase;
    }

    .intern-badge {
      display: inline-block;
      padding: 0.8mm 5mm;
      border: 1px solid #c9a84c;
      border-radius: 2mm;
      font-size: 9px;
      color: #c9a84c;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-weight: 600;
      margin-bottom: 3mm;
    }

    .details-text {
      font-size: 10px;
      color: #555;
      line-height: 1.9;
      max-width: 170mm;
      margin-bottom: 1.5mm;
    }

    .details-text strong {
      color: #1e2d4a;
    }

    .attributes {
      display: flex;
      gap: 4mm;
      justify-content: center;
      margin-bottom: 3mm;
      flex-wrap: wrap;
    }

    .attr-box {
      border: 0.5px solid #e0d5c0;
      border-radius: 1.5mm;
      padding: 1.5mm 4mm;
      background: rgba(201,168,76,0.04);
      text-align: center;
      min-width: 35mm;
    }

    .attr-box .attr-label {
      font-size: 7px;
      text-transform: uppercase;
      color: #aaa;
      letter-spacing: 1px;
    }

    .attr-box .attr-value {
      font-size: 10px;
      font-weight: 600;
      color: #1e2d4a;
      margin-top: 0.5mm;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 0 20mm;
    }

    .signature-box {
      text-align: center;
      flex: 1;
    }

    .signature-line {
      width: 70%;
      margin: 0 auto 1mm;
      border-top: 0.5mm solid #1e2d4a;
    }

    .signature-box p {
      font-size: 9px;
      color: #555;
      font-weight: 600;
    }

    .signature-box .role {
      font-size: 8px;
      color: #aaa;
      font-weight: 400;
      font-style: italic;
    }

    .date-location {
      font-size: 9px;
      color: #888;
      font-style: italic;
      margin-top: 2.5mm;
    }

    .seal {
      position: absolute;
      bottom: 13mm;
      right: 13mm;
      width: 20mm;
      height: 20mm;
      border: 2px solid #c9a84c;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6px;
      font-weight: 700;
      color: #c9a84c;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.3;
      z-index: 10;
      background: rgba(252,250,245,0.92);
    }

    .footer {
      position: absolute;
      bottom: 8.5mm;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 6.5px;
      color: #bbb;
      z-index: 10;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="border-outer"></div>
    <div class="border-inner"></div>

    <div class="stripe-top"></div>
    <div class="stripe-top-gold"></div>
    <div class="stripe-bottom"></div>
    <div class="stripe-bottom-gold"></div>

    <div class="corner corner-tl"></div>
    <div class="corner corner-tr"></div>
    <div class="corner corner-bl"></div>
    <div class="corner corner-br"></div>

    <div class="geo-circle gc-1"></div>
    <div class="geo-circle gc-2"></div>
    <div class="geo-circle gc-3"></div>

    <div class="seal">Sceau<br>${companyName}</div>

    <div class="content">
      <div class="gold-stars">✦ ✦ ✦</div>
      <div class="certificate-title">Attestation de Fin de Stage</div>
      <div class="certificate-subtitle">${companyName}</div>
      <div class="divider-main"></div>

      <p class="certify-text">— Délivrée à —</p>
      <div class="intern-name">${intern.firstName} ${intern.lastName}</div>
      <div class="intern-badge">${typeLabel}</div>

      <p class="details-text">
        Pour avoir accompli <strong>${dureeTexte}</strong> de stage au sein de
        <strong>${companyName}</strong>, service <strong>${data.departmentName || 'N/A'}</strong>,
        du <strong>${dateDebut}</strong> au <strong>${dateFin}</strong>.
      </p>

      ${intern.mission ? `<p class="details-text">Mission : ${intern.mission}</p>` : ''}

      ${noteText ? `<p class="details-text">${noteText}.</p>` : ''}

      <div class="attributes">
        ${intern.schoolName ? `<div class="attr-box"><div class="attr-label">Établissement</div><div class="attr-value">${intern.schoolName}</div></div>` : ''}
        ${intern.studyLevel ? `<div class="attr-box"><div class="attr-label">Niveau</div><div class="attr-value">${intern.studyLevel}</div></div>` : ''}
        ${intern.specialty ? `<div class="attr-box"><div class="attr-label">Spécialité</div><div class="attr-value">${intern.specialty}</div></div>` : ''}
      </div>

      <div class="divider-main"></div>

      <div class="signatures">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p>${settings?.companyName || 'Le Directeur'}</p>
          <p class="role">Directeur Général</p>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <p>Le Responsable Formation</p>
          <p class="role">Tuteur Pédagogique</p>
        </div>
      </div>

      <p class="date-location">Fait à ${companyCity}, le ${dateNow}</p>
    </div>

    <div class="footer">
      Document généré par NexaRH — ${companyName}
    </div>
  </div>
</body>
</html>`
}

export const InternPdfService = {
  async generateCertificate(internId: number): Promise<string> {
    const data = getInternData(internId)
    const html = generateCertificateHtml(data)

    const win = new BrowserWindow({
      width: 1100,
      height: 800,
      show: false,
      webPreferences: { sandbox: true }
    })

    try {
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

      const pdfData = await win.webContents.printToPDF({
        pageSize: 'A4',
        landscape: true,
        printBackground: true,
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      })

      const now = format(new Date(), 'yyyyMMdd_HHmmss')
      const defaultName = `attestation_stage_${data.intern.firstName}_${data.intern.lastName}_${now}.pdf`.replace(/\s+/g, '_')

      const result = await dialog.showSaveDialog(win, {
        title: 'Enregistrer l\'attestation de stage',
        defaultPath: defaultName,
        filters: [{ name: 'Documents PDF', extensions: ['pdf'] }]
      })

      if (result.canceled || !result.filePath) {
        throw new Error('Opération annulée')
      }

      writeFileSync(result.filePath, pdfData)
      return result.filePath
    } finally {
      win.close()
    }
  }
}
