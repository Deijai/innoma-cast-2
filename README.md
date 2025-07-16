# 🎧 PodcastApp - React Native

Um aplicativo completo de podcasts construído com React Native, TypeScript e Expo, oferecendo experiências personalizadas para criadores e ouvintes.

## 🚀 Funcionalidades

### Para Ouvintes
- 🔍 Descobrir podcasts por categoria e criador
- ▶️ Player avançado com controles de velocidade e navegação
- ❤️ Curtir, comentar e compartilhar episódios
- 👥 Seguir podcasts e criadores favoritos
- 💾 Salvar episódios para ouvir depois
- 💰 Apoiar criadores com doações
- 📊 Histórico de reprodução e favoritos
- 🔔 Notificações de novos episódios

### Para Criadores
- 🎙️ Criação e gerenciamento de podcasts
- 🎵 Gravação de áudio com qualidade profissional
- ✂️ Editor básico de áudio (corte, trilha sonora)
- ☁️ Upload automático para Firebase Storage
- 📅 Agendamento de publicações
- 📈 Estatísticas de visualização e engajamento
- 💸 Área de monetização e doações
- 🎬 Organização por temporadas e episódios

## 🛠️ Tecnologias

- **React Native** com TypeScript
- **Expo** + Expo Router (navegação estilo Next.js)
- **Zustand** para gerenciamento de estado
- **AsyncStorage** para persistência local
- **Firebase** (Auth, Firestore, Storage)
- **expo-av** para gravação e reprodução de áudio
- **StyleSheet** para estilização
- **Sistema de temas** (dark/light com persistência)

## 📁 Estrutura do Projeto

```
podcast-app/
├── app/                    # Rotas da aplicação (Expo Router)
│   ├── index.tsx          # Tela de escolha de perfil
│   ├── login.tsx          # Tela de login
│   ├── signup.tsx         # Tela de cadastro
│   ├── dashboard/         # Dashboard personalizado
│   ├── podcasts/          # Criação e gerenciamento
│   ├── episodes/          # Gravação de episódios
│   └── settings/          # Configurações
├── components/            # Componentes reutilizáveis
│   ├── Button.tsx         # Botão customizável
│   ├── Input.tsx          # Input com validação
│   └── PlayerControls.tsx # Controles do player
├── hooks/                 # Hooks personalizados
│   ├── useAuth.ts         # Autenticação
│   ├── useTheme.ts        # Gerenciamento de tema
│   └── useAudio.ts        # Player e gravador
├── store/                 # Estados globais (Zustand)
│   ├── authStore.ts       # Estado de autenticação
│   ├── themeStore.ts      # Estado do tema
│   └── audioStore.ts      # Estado do player
├── types/                 # Tipagens TypeScript
│   └── index.ts           # Todas as interfaces
├── config/                # Configurações
│   └── firebase.ts        # Setup do Firebase
└── assets/                # Imagens e recursos
```

## 🎯 Rotas da Aplicação

- `/` → Escolha de perfil (Criador ou Ouvinte)
- `/login` → Tela de login (Google e Email)
- `/signup` → Cadastro de novo usuário
- `/dashboard` → Home personalizada por perfil
- `/podcasts/new` → Criar novo podcast (criador)
- `/podcasts/[id]` → Visualização pública do podcast
- `/episodes/new` → Gravação de novo episódio
- `/episodes/[id]/edit` → Edição do episódio
- `/settings` → Configurações da conta e tema

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- Expo CLI
- Firebase Project configurado
- Android Studio / Xcode (para desenvolvimento)

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/podcast-app.git
cd podcast-app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o Firebase**
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Authentication (Email/Password e Google)
   - Configure Firestore Database
   - Configure Storage
   - Atualize `config/firebase.ts` com suas credenciais

4. **Execute o projeto**
```bash
# Desenvolvimento
npm start

# Android
npm run android

# iOS
npm run ios
```

## 🔧 Configuração do Firebase

### 1. Authentication
```javascript
// Métodos habilitados:
- Email/Password
- Google Sign-In
```

### 2. Firestore Collections
```
users/
├── {userId}/
│   ├── id: string
│   ├── email: string
│   ├── name: string
│   ├── role: 'creator' | 'listener'
│   └── preferences: object

podcasts/
├── {podcastId}/
│   ├── title: string
│   ├── description: string
│   ├── category: string
│   ├── creatorId: string
│   └── coverImage: string

episodes/
├── {episodeId}/
│   ├── title: string
│   ├── description: string
│   ├── audioUrl: string
│   ├── duration: number
│   └── podcastId: string
```

### 3. Storage Rules
```javascript
// Estrutura de pastas:
storage/
├── podcasts/
│   ├── covers/
│   └── audio/
├── episodes/
│   └── audio/
└── users/
    └── avatars/
```

## 🎨 Sistema de Temas

O app suporta três modos de tema:
- **Light**: Tema claro
- **Dark**: Tema escuro  
- **System**: Segue o tema do sistema

```typescript
// Cores disponíveis
const colors = {
  light: {
    primary: '#007AFF',
    background: '#FFFFFF',
    text: '#000000',
    // ...
  },
  dark: {
    primary: '#0A84FF',
    background: '#000000',
    text: '#FFFFFF',
    // ...
  }
};
```

## 🔊 Funcionalidades de Áudio

### Player
- ▶️ Play/Pause
- ⏭️ Próximo/Anterior
- 🔄 Velocidade (1x, 1.25x, 1.5x, 2x)
- ⏱️ Controle de posição
- 🔁 Modo repetição
- 📱 Controles em segundo plano

### Gravador
- 🎙️ Gravação em alta qualidade
- ⏸️ Pausar/Retomar gravação
- 📊 Visualização em tempo real
- 💾 Salvamento local
- ☁️ Upload para Firebase

## 📱 Componentes Principais

### Button
```tsx
<Button
  title="Entrar"
  onPress={handleLogin}
  variant="primary"
  size="large"
  loading={isLoading}
/>
```

### Input
```tsx
<Input
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  leftIcon="mail"
  error={emailError}
/>
```

### PlayerControls
```tsx
<PlayerControls compact={false} />
```

## 🗄️ Gerenciamento de Estado

### Auth Store
```typescript
const { user, signIn, signUp, signOut } = useAuth();
```

### Theme Store
```typescript
const { theme, colors, setTheme } = useTheme();
```

### Audio Store
```typescript
const { 
  play, pause, loadEpisode, 
  startRecording, stopRecording 
} = useAudio();
```

## 📦 Scripts Disponíveis

```bash
npm start          # Inicia o servidor de desenvolvimento
npm run android    # Executa no Android
npm run ios        # Executa no iOS
npm run web        # Executa no navegador
npm run build      # Build para produção
```

## 🔐 Segurança

- 🔒 Autenticação obrigatória
- 🛡️ Validação de dados no frontend
- 🔑 Regras de segurança no Firestore
- 📁 Controle de acesso no Storage
- 🚫 Sanitização de inputs

## 📈 Próximos Passos

- [ ] Implementar busca avançada
- [ ] Sistema de comentários
- [ ] Push notifications
- [ ] Integração com pagamentos (PIX/Cartão)
- [ ] Player offline
- [ ] Analytics detalhadas
- [ ] Sistema de moderação
- [ ] API REST complementar

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para dúvidas e suporte:
- 📧 Email: suporte@podcastapp.com
- 💬 Discord: [Link do servidor]
- 📖 Documentação: [Link da wiki]

---

**Desenvolvido com ❤️ usando React Native e TypeScript**