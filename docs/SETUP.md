# 🚀 Guia de Configuração - PodcastApp

Este guia irá te ajudar a configurar o projeto do zero até ter o app funcionando completamente.

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** 18.x ou superior
- **npm** ou **yarn**
- **Expo CLI**: `npm install -g @expo/cli`
- **Git**
- **Android Studio** (para Android)
- **Xcode** (para iOS - apenas macOS)

## 🔧 Passo 1: Clone e Instale

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/podcast-app.git
cd podcast-app

# 2. Instale as dependências
npm install

# 3. Copie o arquivo de ambiente
cp .env.example .env
```

## 🔥 Passo 2: Configuração do Firebase

### 2.1 Criar Projeto Firebase

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Clique em "Criar projeto"
3. Digite o nome do projeto: `podcast-app`
4. Desabilite Google Analytics (opcional)
5. Clique em "Criar projeto"

### 2.2 Configurar Authentication

1. No painel do Firebase, vá em **Authentication**
2. Clique em "Começar"
3. Na aba **Sign-in method**, habilite:
   - **Email/senha**
   - **Google** (opcional)

### 2.3 Configurar Firestore Database

1. Vá em **Firestore Database**
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de teste"
4. Selecione uma localização próxima
5. Clique em "Concluído"

### 2.4 Configurar Storage

1. Vá em **Storage**
2. Clique em "Começar"
3. Aceite as regras padrão
4. Escolha a mesma localização do Firestore

### 2.5 Obter Credenciais

1. Vá em **Configurações do projeto** (ícone de engrenagem)
2. Na aba **Geral**, role até "Seus apps"
3. Clique em "Adicionar app" → "Web" (ícone `</>`)
4. Digite o nome: `podcast-app`
5. **NÃO** marque "Configurar hosting"
6. Clique em "Registrar app"
7. **Copie as credenciais** que aparecerão

### 2.6 Configurar Arquivo .env

Abra o arquivo `.env` e substitua pelas suas credenciais:

```bash
FIREBASE_API_KEY=AIzaSyC...
FIREBASE_AUTH_DOMAIN=podcast-app-12345.firebaseapp.com
FIREBASE_PROJECT_ID=podcast-app-12345
FIREBASE_STORAGE_BUCKET=podcast-app-12345.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef...
```

### 2.7 Atualizar config/firebase.ts

```typescript
// config/firebase.ts
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
```

## 📱 Passo 3: Configuração do Expo

### 3.1 Criar Conta Expo

1. Acesse [expo.dev](https://expo.dev)
2. Crie uma conta ou faça login
3. No terminal, faça login: `expo login`

### 3.2 Atualizar app.json

```json
{
  "expo": {
    "name": "PodcastApp",
    "slug": "podcast-app-seu-nome",
    "owner": "seu-username-expo",
    // ... resto da configuração
  }
}
```

## 🔊 Passo 4: Permissões de Áudio

### Android (android/app/src/main/AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
```

### iOS (ios/PodcastApp/Info.plist)

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Este app precisa acessar o microfone para gravar podcasts</string>
```

## 🎯 Passo 5: Regras do Firestore

Configure as regras de segurança no Firestore:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Anyone can read podcasts and episodes
    match /podcasts/{podcastId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == resource.data.creatorId;
    }
    
    match /episodes/{episodeId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 📁 Passo 6: Regras do Storage

Configure as regras do Firebase Storage:

```javascript
// Storage Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload their own content
    match /podcasts/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /episodes/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Passo 7: Executar o Projeto

```bash
# Iniciar o servidor de desenvolvimento
npm start

# Ou para plataformas específicas
npm run android  # Para Android
npm run ios      # Para iOS
npm run web      # Para Web
```

## 📱 Passo 8: Testar no Dispositivo

### Usando Expo Go

1. Instale o **Expo Go** no seu smartphone
2. Escaneie o QR code que aparece no terminal
3. O app será carregado no dispositivo

### Build de Desenvolvimento

```bash
# Para Android
expo run:android

# Para iOS (apenas macOS)
expo run:ios
```

## 🔍 Passo 9: Verificação

Teste as seguintes funcionalidades:

- ✅ **Escolha de perfil** na tela inicial
- ✅ **Cadastro** de novo usuário
- ✅ **Login** com email/senha
- ✅ **Dashboard** personalizado
- ✅ **Criação de podcast** (criadores)
- ✅ **Gravação de áudio** (criadores)
- ✅ **Troca de tema** nas configurações
- ✅ **Logout** funcionando

## 🐛 Resolução de Problemas

### Erro: "Expo CLI not found"
```bash
npm install -g @expo/cli
```

### Erro: "Firebase not configured"
- Verifique se o arquivo `.env` está configurado
- Confirme se as credenciais estão corretas

### Erro: "Permission denied" (microfone)
- Verifique se as permissões estão configuradas
- Teste em um dispositivo físico

### Erro: "Metro bundler failed"
```bash
# Limpar cache
npm start -- --clear
```

### Erro: "Android build failed"
```bash
# Limpar e rebuildar
cd android
./gradlew clean
cd ..
npm run android
```

## 📚 Recursos Adicionais

- [Documentação do Expo](https://docs.expo.dev)
- [Documentação do Firebase](https://firebase.google.com/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)

## 🆘 Precisa de Ajuda?

Se encontrar problemas:

1. Verifique se seguiu todos os passos
2. Consulte os logs de erro no console
3. Procure soluções na documentação oficial
4. Abra uma issue no repositório do projeto

---

**Parabéns! 🎉 Seu app de podcasts está pronto para uso!**