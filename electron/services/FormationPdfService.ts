import { getDb } from '../database/connection'
import { inscriptions, apprenants, formations, companySettings } from '../database/schema'
import { eq } from 'drizzle-orm'
import { BrowserWindow, dialog } from 'electron'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { writeFileSync } from 'fs'

function getInscriptionData(inscriptionId: number) {
  const db = getDb()
  const inscription = db.select().from(inscriptions).where(eq(inscriptions.id, inscriptionId)).get()
  if (!inscription) throw new Error('Inscription non trouvée')

  const apprenant = db.select().from(apprenants).where(eq(apprenants.id, inscription.apprenantId)).get()
  if (!apprenant) throw new Error('Apprenant non trouvé')

  const formation = db.select().from(formations).where(eq(formations.id, inscription.formationId)).get()
  if (!formation) throw new Error('Formation non trouvée')

  const settings = db.select().from(companySettings).where(eq(companySettings.id, 1)).get()

  return { inscription, apprenant, formation, settings }
}

function generateReceiptHtml(data: {
  inscription: any; apprenant: any; formation: any; settings: any;
  paiement: { montant: number; datePaiement: string; modePaiement: string; reference?: string }
}): string {
  const { inscription, apprenant, formation, settings, paiement } = data
  const companyName = settings?.companyName || 'Mon Entreprise'
  const dateFormatted = format(new Date(paiement.datePaiement), 'dd/MM/yyyy')
  const nowFormatted = format(new Date(), 'dd/MM/yyyy HH:mm')
  const totalPaye = inscription.montantPaye || 0
  const reste = inscription.frais - totalPaye

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    @page { margin: 12mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11px;
      color: #1a1a2e;
      line-height: 1.5;
      background: #fff;
    }
    .receipt {
      max-width: 210mm;
      margin: 0 auto;
      border: 2px solid #0D9488;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px double #0D9488;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .header h1 {
      font-size: 20px;
      color: #0D9488;
      margin: 0;
      letter-spacing: 1px;
    }
    .header h2 {
      font-size: 14px;
      color: #1a1a2e;
      margin-top: 6px;
      font-weight: 600;
    }
    .header p { color: #555; font-size: 10px; margin: 2px 0; }
    .info-grid {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .info-box {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 8px 10px;
    }
    .info-box h4 {
      font-size: 9px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .info-box p { font-size: 11px; font-weight: 600; margin: 1px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
    th, td { padding: 6px 8px; text-align: left; font-size: 10px; border: 1px solid #e5e7eb; }
    th { background: #f3f4f6; font-weight: 700; color: #374151; }
    .numeric { text-align: right; }
    .total-row td { font-weight: 700; background: #f0fdfa; }
    .grand-total td { font-weight: 800; background: #0D9488; color: #fff; }
    .footer {
      text-align: center;
      padding-top: 12px;
      border-top: 1px solid #e5e7eb;
      font-size: 8px;
      color: #9ca3af;
    }
    .stamp {
      position: absolute;
      bottom: 60px;
      right: 40px;
      width: 120px;
      height: 120px;
      border: 3px solid #0D9488;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #0D9488;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      opacity: 0.6;
      transform: rotate(-15deg);
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="header">
      <h1>${companyName}</h1>
      <p>${settings?.companyAddress || ''} | Tel: ${settings?.companyPhone || ''}</p>
      <h2>REÇU DE PAIEMENT</h2>
      <p>N° ${paiement.reference || 'N/A'} | Date: ${dateFormatted}</p>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h4>Apprenant</h4>
        <p>${apprenant.nom} ${apprenant.prenom}</p>
        <p>Matricule: ${apprenant.matricule}</p>
      </div>
      <div class="info-box">
        <h4>Formation</h4>
        <p>${formation.name}</p>
        <p>Durée: ${formation.duree || 'N/A'}</p>
      </div>
      <div class="info-box">
        <h4>Paiement</h4>
        <p>Mode: ${paiement.modePaiement}</p>
        <p>${paiement.reference ? `Réf: ${paiement.reference}` : ''}</p>
      </div>
    </div>

    <table>
      <tr>
        <th>Libellé</th>
        <th class="numeric">Montant</th>
      </tr>
      <tr>
        <td>Frais de formation</td>
        <td class="numeric">${inscription.frais.toLocaleString()} XAF</td>
      </tr>
      <tr>
        <td>Montant versé</td>
        <td class="numeric">${paiement.montant.toLocaleString()} XAF</td>
      </tr>
      <tr class="grand-total">
        <td>TOTAL VERSÉ</td>
        <td class="numeric">${totalPaye.toLocaleString()} XAF</td>
      </tr>
    </table>

    <table>
      <tr>
        <td><strong>Reste à payer</strong></td>
        <td class="numeric"><strong>${Math.max(0, reste).toLocaleString()} XAF</strong></td>
      </tr>
    </table>

    <div class="footer">
      Document généré par NexaRH le ${nowFormatted}
    </div>
  </div>
</body>
</html>`
}

function generateCertificateHtml(data: {
  inscription: any; apprenant: any; formation: any; settings: any
}): string {
  const { inscription, apprenant, formation, settings } = data
  const companyName = settings?.companyName || 'Mon Entreprise'
  const dateFin = inscription.dateFin
    ? format(new Date(inscription.dateFin), 'dd MMMM yyyy', { locale: fr })
    : format(new Date(), 'dd MMMM yyyy', { locale: fr })
  const dateInscription = format(new Date(inscription.dateInscription), 'dd MMMM yyyy', { locale: fr })

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
      font-family: 'Times New Roman', Georgia, serif;
      background: #d4cfc4;
      width: 297mm;
      height: 210mm;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .certificate {
      width: 275mm;
      height: 188mm;
      background: #fcf9f0;
      position: relative;
      overflow: hidden;
      box-shadow: 0 6mm 18mm rgba(0,0,0,0.2);
    }

    .side-band {
      position: absolute;
      top: 0;
      left: 0;
      width: 18mm;
      height: 100%;
      background: linear-gradient(180deg, #1e3a5f 0%, #2d5a87 40%, #1e3a5f 100%);
      z-index: 5;
    }

    .side-band-gold {
      position: absolute;
      top: 0;
      left: 18mm;
      width: 2mm;
      height: 100%;
      background: linear-gradient(180deg, #c9a84c 0%, #f0d78c 50%, #c9a84c 100%);
      z-index: 5;
    }

    .top-bar {
      position: absolute;
      top: 0;
      left: 20mm;
      right: 0;
      height: 5mm;
      background: linear-gradient(90deg, #1e3a5f, #2d5a87);
      z-index: 4;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .top-bar-gold {
      position: absolute;
      top: 5mm;
      left: 20mm;
      right: 0;
      height: 1.5mm;
      background: linear-gradient(90deg, #c9a84c, #f0d78c);
      z-index: 4;
    }

    .bottom-bar {
      position: absolute;
      bottom: 0;
      left: 20mm;
      right: 0;
      height: 5mm;
      background: linear-gradient(90deg, #2d5a87, #1e3a5f);
      z-index: 4;
    }

    .bottom-bar-gold {
      position: absolute;
      bottom: 5mm;
      left: 20mm;
      right: 0;
      height: 1.5mm;
      background: linear-gradient(90deg, #f0d78c, #c9a84c);
      z-index: 4;
    }

    .corner-accent { position: absolute; pointer-events: none; z-index: 6; }
    .ca-tl {
      top: 0; left: 20mm;
      width: 0; height: 0;
      border-style: solid;
      border-width: 22mm 22mm 0 0;
      border-color: #c9a84c transparent transparent transparent;
      opacity: 0.3;
    }
    .ca-tr {
      top: 0; right: 0;
      width: 0; height: 0;
      border-style: solid;
      border-width: 0 22mm 22mm 0;
      border-color: transparent #c9a84c transparent transparent;
      opacity: 0.3;
    }
    .ca-bl {
      bottom: 0; left: 20mm;
      width: 0; height: 0;
      border-style: solid;
      border-width: 0 0 22mm 22mm;
      border-color: transparent transparent #c9a84c transparent;
      opacity: 0.3;
    }
    .ca-br {
      bottom: 0; right: 0;
      width: 0; height: 0;
      border-style: solid;
      border-width: 22mm 0 0 22mm;
      border-color: transparent transparent transparent #c9a84c;
      opacity: 0.3;
    }

    .content {
      position: absolute;
      top: 12mm;
      left: 32mm;
      right: 12mm;
      bottom: 12mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      z-index: 3;
    }

    .award-icon {
      font-size: 24px;
      color: #c9a84c;
      margin-bottom: 3mm;
      letter-spacing: 6px;
    }

    .institution {
      font-size: 14px;
      color: #1e3a5f;
      letter-spacing: 4px;
      text-transform: uppercase;
      font-weight: 700;
      margin-bottom: 1mm;
    }

    .subtitle {
      font-size: 9px;
      color: #999;
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 4mm;
    }

    .divider-line {
      width: 60mm;
      height: 0.5mm;
      background: #c9a84c;
      margin-bottom: 4mm;
    }

    .certify-text {
      font-size: 11px;
      color: #888;
      font-style: italic;
      margin-bottom: 2mm;
    }

    .apprenant-name {
      font-size: 30px;
      color: #1e3a5f;
      font-weight: 700;
      letter-spacing: 1.5px;
      margin-bottom: 2mm;
      text-transform: uppercase;
      border-bottom: 1px solid #e0d5c0;
      border-top: 1px solid #e0d5c0;
      padding: 2mm 10mm;
    }

    .for-text {
      font-size: 10px;
      color: #999;
      font-style: italic;
      margin: 2mm 0 1mm;
    }

    .formation-name {
      font-size: 17px;
      color: #2d5a87;
      font-weight: 700;
      font-style: italic;
      margin-bottom: 3mm;
    }

    .attestation-text {
      font-size: 10px;
      color: #555;
      line-height: 1.9;
      max-width: 160mm;
      margin-bottom: 5mm;
    }

    .attestation-text strong {
      color: #1e3a5f;
    }

    .signatures {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 0 18mm;
    }

    .signature-box {
      text-align: center;
      flex: 1;
    }

    .signature-line {
      width: 65%;
      margin: 0 auto 1.5mm;
      border-top: 0.5mm solid #1e3a5f;
    }

    .signature-box p {
      font-size: 10px;
      color: #555;
      font-weight: 600;
    }

    .signature-box .role {
      font-size: 8.5px;
      color: #aaa;
      font-weight: 400;
      font-style: italic;
    }

    .date-line {
      font-size: 10px;
      color: #777;
      margin-top: 3mm;
      font-style: italic;
    }

    .seal-round {
      position: absolute;
      bottom: 16mm;
      right: 16mm;
      width: 22mm;
      height: 22mm;
      border: 2.5px solid #c9a84c;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 6.5px;
      font-weight: 700;
      color: #c9a84c;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
      line-height: 1.3;
      z-index: 10;
      background: rgba(252,249,240,0.92);
      box-shadow: 0 0 0 2px rgba(201,168,76,0.15);
    }

    .ribbon {
      position: absolute;
      top: 6mm;
      right: 10mm;
      z-index: 10;
      width: 8mm;
      height: 28mm;
      background: linear-gradient(180deg, #c9a84c, #f0d78c);
      border-radius: 0 0 2mm 2mm;
    }

    .ribbon-fold {
      position: absolute;
      top: 34mm;
      right: 10mm;
      z-index: 9;
      width: 0;
      height: 0;
      border-left: 4mm solid transparent;
      border-right: 4mm solid transparent;
      border-top: 6mm solid #c9a84c;
    }

    .footer-line {
      position: absolute;
      bottom: 6.5mm;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 7px;
      color: #bbb;
      z-index: 10;
    }

    .watermark {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-30deg);
      font-size: 60px;
      color: rgba(201,168,76,0.06);
      font-weight: 700;
      letter-spacing: 12px;
      white-space: nowrap;
      z-index: 1;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="side-band"></div>
    <div class="side-band-gold"></div>
    <div class="top-bar"></div>
    <div class="top-bar-gold"></div>
    <div class="bottom-bar"></div>
    <div class="bottom-bar-gold"></div>

    <div class="corner-accent ca-tl"></div>
    <div class="corner-accent ca-tr"></div>
    <div class="corner-accent ca-bl"></div>
    <div class="corner-accent ca-br"></div>

    <div class="ribbon"></div>
    <div class="ribbon-fold"></div>
    <div class="seal-round">Sceau<br>${companyName}</div>
    <div class="watermark">${companyName}</div>

    <div class="content">
      <div class="award-icon">✦ ✦ ✦</div>
      <div class="institution">${companyName}</div>
      <div class="subtitle">Organisme de Formation</div>
      <div class="divider-line"></div>

      <p class="certify-text">— Attestation de fin de formation —</p>

      <div class="apprenant-name">${apprenant.nom} ${apprenant.prenom}</div>

      <p class="for-text">pour avoir suivi avec succès la formation</p>
      <div class="formation-name">« ${formation.name} »</div>

      <p class="attestation-text">
        D'une durée de <strong>${formation.duree || 'N/A'}</strong>,
        du <strong>${dateInscription}</strong> au <strong>${dateFin}</strong>.
        ${apprenant.prenom} ${apprenant.nom} a satisfait à toutes les évaluations
        et démontré les compétences requises pour l'obtention du présent certificat.
      </p>

      <div class="divider-line"></div>

      <div class="signatures">
        <div class="signature-box">
          <div class="signature-line"></div>
          <p>${settings?.companyName || 'Le Directeur'}</p>
          <p class="role">Directeur Général</p>
        </div>
        <div class="signature-box">
          <div class="signature-line"></div>
          <p>Le Responsable Formation</p>
          <p class="role">Responsable Pédagogique</p>
        </div>
      </div>

      <p class="date-line">Fait à ${(settings?.companyAddress || 'Dakar').split(',')[0].trim() || 'Dakar'}, le ${dateFin}</p>
    </div>

    <div class="footer-line">
      Document généré par NexaRH — ${companyName}
    </div>
  </div>
</body>
</html>`
}

export const FormationPdfService = {
  async generateReceipt(inscriptionId: number, paiementId: number): Promise<string> {
    const { PaiementService } = await import('./PaiementService')
    const { inscription, apprenant, formation, settings } = getInscriptionData(inscriptionId)
    const paiement = await PaiementService.getById(paiementId)
    if (!paiement) throw new Error('Paiement non trouvé')

    const html = generateReceiptHtml({ inscription, apprenant, formation, settings, paiement })

    const win = new BrowserWindow({
      width: 800,
      height: 1100,
      show: false,
      webPreferences: { sandbox: true }
    })

    try {
      await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

      const pdfData = await win.webContents.printToPDF({
        pageSize: 'A4',
        printBackground: true,
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
      })

      const now = format(new Date(), 'yyyyMMdd_HHmmss')
      const defaultName = `recu_paiement_${apprenant.matricule}_${now}.pdf`

      const result = await dialog.showSaveDialog(win, {
        title: 'Enregistrer le reçu de paiement',
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
  },

  async generateCertificate(inscriptionId: number): Promise<string> {
    const { inscription, apprenant, formation, settings } = getInscriptionData(inscriptionId)

    const html = generateCertificateHtml({ inscription, apprenant, formation, settings })

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
      const defaultName = `attestation_formation_${apprenant.matricule}_${now}.pdf`

      const result = await dialog.showSaveDialog(win, {
        title: 'Enregistrer l\'attestation de formation',
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
