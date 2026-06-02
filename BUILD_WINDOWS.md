# Construction de l'installateur Windows

## Méthode 1 : GitHub Actions (recommandée)

1. Poussez le code vers GitHub
2. Allez dans **Actions** → **Build Windows Installer**
3. Cliquez **Run workflow** → sélectionnez la branche → **Run workflow**
4. Téléchargez l'artefact `NexaRH-Setup` contenant l'installateur `.exe`

## Méthode 2 : Construction locale sur Windows

### Prérequis
- Node.js 20+
- Git
- Python (nécessaire pour `node-gyp`)

### Étapes

```powershell
# 1. Cloner ou copier le projet
cd C:\Projects\nexarh

# 2. Installer les dépendances
npm install

# 3. Construire l'installateur
npm run dist:win
```

L'installateur sera généré dans le dossier `dist-installer/` sous forme de fichier `NexaRH Setup X.X.X.exe`.

### Distribution

Le fichier `.exe` généré peut être distribué à n'importe quel utilisateur Windows. 
L'installateur propose :
- Choix du dossier d'installation
- Raccourci bureau et menu démarrer
- Désinstallation via le Panneau de configuration

> **Note** : Si vous souhaitez signer l'installateur avec un certificat code signing, 
> configurez les variables d'environnement `WIN_CSC_LINK` et `WIN_CSC_KEY_PASSWORD` 
> avant de lancer la construction.
