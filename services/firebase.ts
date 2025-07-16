// services/firebase.ts - CÓDIGO COMPLETO APÓS ALTERAÇÕES
import {
    collection,
    deleteDoc,
    doc,
    DocumentData,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    QueryDocumentSnapshot,
    setDoc,
    startAfter,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import {
    deleteObject,
    getDownloadURL,
    ref,
    uploadBytes
} from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { Episode, Podcast, User } from '../types';

// =====================================================
// UTILITÁRIO PARA CONVERTER TIMESTAMPS DO FIRESTORE
// =====================================================

// Função para converter Timestamp do Firestore em Date
const convertTimestamp = (timestamp: any): Date => {
    if (!timestamp) return new Date();

    // Se já é um objeto Date
    if (timestamp instanceof Date) {
        return timestamp;
    }

    // Se é um Timestamp do Firestore
    if (timestamp instanceof Timestamp) {
        return timestamp.toDate();
    }

    // Se é um objeto com seconds/nanoseconds
    if (timestamp.seconds !== undefined) {
        return new Timestamp(timestamp.seconds, timestamp.nanoseconds || 0).toDate();
    }

    // Se é uma string, tentar converter
    if (typeof timestamp === 'string') {
        return new Date(timestamp);
    }

    // Fallback
    return new Date();
};

// =====================================================
// PODCAST SERVICES
// =====================================================

export const podcastService = {
    // Create new podcast
    create: async (podcastData: Omit<Podcast, 'id' | 'creator' | 'episodes' | 'followers' | 'createdAt' | 'updatedAt'>, userId: string): Promise<string> => {
        try {
            const podcastRef = doc(collection(db, 'podcasts'));
            const podcast = {
                id: podcastRef.id,
                ...podcastData,
                creatorId: userId,
                followers: 0,
                isSubscribed: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            await setDoc(podcastRef, podcast);
            return podcastRef.id;
        } catch (error) {
            console.error('Error creating podcast:', error);
            throw error;
        }
    },

    // Get podcast by ID
    getById: async (podcastId: string): Promise<Podcast | null> => {
        try {
            const podcastDoc = await getDoc(doc(db, 'podcasts', podcastId));
            if (!podcastDoc.exists()) return null;

            const podcastData = podcastDoc.data();

            // Get creator info
            const creatorDoc = await getDoc(doc(db, 'users', podcastData.creatorId));
            const creatorData = creatorDoc.data();

            // Get episodes
            const episodesQuery = query(
                collection(db, 'episodes'),
                where('podcastId', '==', podcastId),
                where('isPublished', '==', true),
                orderBy('publishedAt', 'desc')
            );
            const episodesSnapshot = await getDocs(episodesQuery);
            const episodes = episodesSnapshot.docs.map(episodeDoc => {
                const episodeData = episodeDoc.data();
                return {
                    id: episodeDoc.id,
                    ...episodeData,
                    // Converter timestamps para Date
                    publishedAt: convertTimestamp(episodeData.publishedAt),
                    createdAt: convertTimestamp(episodeData.createdAt),
                    scheduledFor: episodeData.scheduledFor ? convertTimestamp(episodeData.scheduledFor) : undefined,
                };
            }) as Episode[];

            // Converter timestamps do podcast
            return {
                id: podcastDoc.id,
                ...podcastData,
                createdAt: convertTimestamp(podcastData.createdAt),
                updatedAt: convertTimestamp(podcastData.updatedAt),
                creator: {
                    ...creatorData,
                    createdAt: convertTimestamp(creatorData?.createdAt),
                    updatedAt: convertTimestamp(creatorData?.updatedAt),
                } as User,
                episodes
            } as Podcast;
        } catch (error) {
            console.error('Error getting podcast:', error);
            throw error;
        }
    },

    // Get podcasts by creator
    getByCreator: async (userId: string): Promise<Podcast[]> => {
        try {
            const q = query(
                collection(db, 'podcasts'),
                where('creatorId', '==', userId),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            const podcasts = await Promise.all(snapshot.docs.map(async (podcastDoc) => {
                const podcastData = podcastDoc.data();

                console.log('📊 Dados brutos do podcast:', podcastData);

                // Get creator info
                const creatorDoc = await getDoc(doc(db, 'users', podcastData.creatorId));
                const creatorData = creatorDoc.data();

                // Get episode count
                const episodesQuery = query(
                    collection(db, 'episodes'),
                    where('podcastId', '==', podcastDoc.id),
                    where('isPublished', '==', true)
                );
                const episodesSnapshot = await getDocs(episodesQuery);

                const episodes = episodesSnapshot.docs.map(episodeDoc => {
                    const episodeData = episodeDoc.data();
                    return {
                        id: episodeDoc.id,
                        ...episodeData,
                        // Converter timestamps para Date
                        publishedAt: convertTimestamp(episodeData.publishedAt),
                        createdAt: convertTimestamp(episodeData.createdAt),
                        scheduledFor: episodeData.scheduledFor ? convertTimestamp(episodeData.scheduledFor) : undefined,
                    };
                }) as Episode[];

                // Converter timestamps do podcast
                const convertedPodcast = {
                    id: podcastDoc.id,
                    ...podcastData,
                    createdAt: convertTimestamp(podcastData.createdAt),
                    updatedAt: convertTimestamp(podcastData.updatedAt),
                    creator: {
                        ...creatorData,
                        createdAt: convertTimestamp(creatorData?.createdAt),
                        updatedAt: convertTimestamp(creatorData?.updatedAt),
                    } as User,
                    episodes
                } as Podcast;

                console.log('✅ Podcast convertido:', {
                    id: convertedPodcast.id,
                    title: convertedPodcast.title,
                    createdAt: convertedPodcast.createdAt,
                    createdAtType: typeof convertedPodcast.createdAt,
                    isValidDate: convertedPodcast.createdAt instanceof Date && !isNaN(convertedPodcast.createdAt.getTime())
                });

                return convertedPodcast;
            }));

            return podcasts;
        } catch (error) {
            console.error('Error getting podcasts by creator:', error);
            throw error;
        }
    },

    // Get all public podcasts (for discover)
    getPublic: async (categoryFilter?: string, searchQuery?: string, lastDoc?: QueryDocumentSnapshot<DocumentData>): Promise<{ podcasts: Podcast[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> => {
        try {
            let q = query(
                collection(db, 'podcasts'),
                orderBy('createdAt', 'desc'),
                limit(20)
            );

            if (categoryFilter) {
                q = query(q, where('category', '==', categoryFilter));
            }

            if (lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);
            const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

            let podcasts = await Promise.all(snapshot.docs.map(async (podcastDoc) => {
                const podcastData = podcastDoc.data();

                // Get creator info
                const creatorDoc = await getDoc(doc(db, 'users', podcastData.creatorId));
                const creatorData = creatorDoc.data();

                return {
                    id: podcastDoc.id,
                    ...podcastData,
                    // Converter timestamps
                    createdAt: convertTimestamp(podcastData.createdAt),
                    updatedAt: convertTimestamp(podcastData.updatedAt),
                    creator: {
                        ...creatorData,
                        createdAt: convertTimestamp(creatorData?.createdAt),
                        updatedAt: convertTimestamp(creatorData?.updatedAt),
                    } as User,
                    episodes: [] // Don't load all episodes for list view
                } as unknown as Podcast;
            }));

            // Filter by search query if provided
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                podcasts = podcasts.filter(podcast =>
                    podcast.title.toLowerCase().includes(query) ||
                    podcast.description.toLowerCase().includes(query) ||
                    podcast.creator.name.toLowerCase().includes(query)
                );
            }

            return { podcasts, lastDoc: newLastDoc };
        } catch (error) {
            console.error('Error getting public podcasts:', error);
            throw error;
        }
    },

    // Update podcast
    update: async (podcastId: string, updates: Partial<Podcast>): Promise<void> => {
        try {
            await updateDoc(doc(db, 'podcasts', podcastId), {
                ...updates,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error('Error updating podcast:', error);
            throw error;
        }
    },

    // Delete podcast
    delete: async (podcastId: string): Promise<void> => {
        try {
            // Delete all episodes first
            const episodesQuery = query(
                collection(db, 'episodes'),
                where('podcastId', '==', podcastId)
            );
            const episodesSnapshot = await getDocs(episodesQuery);

            await Promise.all(episodesSnapshot.docs.map(episodeDoc =>
                episodeService.delete(episodeDoc.id)
            ));

            // Delete podcast
            await deleteDoc(doc(db, 'podcasts', podcastId));
        } catch (error) {
            console.error('Error deleting podcast:', error);
            throw error;
        }
    }
};

// =====================================================
// EPISODE SERVICES - IMPLEMENTAÇÃO COMPLETA
// =====================================================

export const episodeService = {
    // ✅ CORRIGIR: Create new episode
    create: async (episodeData: Omit<Episode, 'id' | 'likes' | 'comments' | 'isLiked' | 'isSaved' | 'createdAt'>): Promise<string> => {
        try {
            console.log('💾 Criando episódio no Firestore...');
            console.log('📋 Dados:', episodeData);

            // Validações
            if (!episodeData.podcastId) {
                throw new Error('podcastId é obrigatório');
            }
            if (!episodeData.title?.trim()) {
                throw new Error('Título é obrigatório');
            }
            if (!episodeData.audioUrl) {
                throw new Error('URL do áudio é obrigatória');
            }

            // Criar ID único
            const episodeRef = doc(collection(db, 'episodes'));

            // Dados completos do episódio
            const episode = {
                id: episodeRef.id,
                ...episodeData,
                title: episodeData.title.trim(),
                description: episodeData.description?.trim() || '',
                likes: 0,
                isLiked: false,
                isSaved: false,
                comments: [],
                createdAt: new Date(),
            };

            console.log('💾 Salvando episódio:', episode.id);
            await setDoc(episodeRef, episode);

            console.log('✅ Episódio criado com sucesso:', episodeRef.id);
            return episodeRef.id;
        } catch (error) {
            console.error('❌ Erro ao criar episódio:', error);
            throw error;
        }
    },

    // Get episode by ID
    getById: async (episodeId: string): Promise<Episode | null> => {
        try {
            const episodeDoc = await getDoc(doc(db, 'episodes', episodeId));
            if (!episodeDoc.exists()) return null;

            const episodeData = episodeDoc.data();
            return {
                id: episodeDoc.id,
                ...episodeData,
                publishedAt: convertTimestamp(episodeData.publishedAt),
                createdAt: convertTimestamp(episodeData.createdAt),
                scheduledFor: episodeData.scheduledFor ? convertTimestamp(episodeData.scheduledFor) : undefined,
            } as Episode;
        } catch (error) {
            console.error('Error getting episode:', error);
            throw error;
        }
    },

    // Get episodes by podcast
    getByPodcast: async (podcastId: string, publishedOnly: boolean = true): Promise<Episode[]> => {
        try {
            let q = query(
                collection(db, 'episodes'),
                where('podcastId', '==', podcastId),
                orderBy('episodeNumber', 'desc')
            );

            if (publishedOnly) {
                q = query(q, where('isPublished', '==', true));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(episodeDoc => {
                const episodeData = episodeDoc.data();
                return {
                    id: episodeDoc.id,
                    ...episodeData,
                    publishedAt: convertTimestamp(episodeData.publishedAt),
                    createdAt: convertTimestamp(episodeData.createdAt),
                    scheduledFor: episodeData.scheduledFor ? convertTimestamp(episodeData.scheduledFor) : undefined,
                };
            }) as Episode[];
        } catch (error) {
            console.error('Error getting episodes by podcast:', error);
            throw error;
        }
    },

    // ✅ IMPLEMENTAR: Update episode
    update: async (episodeId: string, updates: Partial<Episode>): Promise<void> => {
        try {
            console.log('📝 Atualizando episódio:', episodeId);
            console.log('🔄 Updates:', updates);

            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            await updateDoc(doc(db, 'episodes', episodeId), updateData);
            console.log('✅ Episódio atualizado');
        } catch (error) {
            console.error('❌ Erro ao atualizar episódio:', error);
            throw error;
        }
    },

    // ✅ CORRIGIR: Delete episode
    delete: async (episodeId: string): Promise<void> => {
        try {
            console.log('🗑️ Deletando episódio:', episodeId);

            // 1. Obter dados do episódio
            const episode = await episodeService.getById(episodeId);
            if (!episode) {
                throw new Error('Episódio não encontrado');
            }

            // 2. Deletar arquivo de áudio do Storage
            if (episode.audioUrl) {
                await storageService.deleteEpisodeAudio(episode.audioUrl);
            }

            // 3. Deletar documento do Firestore
            await deleteDoc(doc(db, 'episodes', episodeId));

            console.log('✅ Episódio deletado completamente');
        } catch (error) {
            console.error('❌ Erro ao deletar episódio:', error);
            throw error;
        }
    },

    // ✅ IMPLEMENTAR: Toggle like
    toggleLike: async (userId: string, episodeId: string): Promise<boolean> => {
        try {
            const likeRef = doc(db, 'likes', `${userId}_${episodeId}`);
            const likeDoc = await getDoc(likeRef);

            if (likeDoc.exists()) {
                // Unlike
                await deleteDoc(likeRef);
                return false;
            } else {
                // Like
                await setDoc(likeRef, {
                    userId,
                    episodeId,
                    createdAt: new Date()
                });
                return true;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    },

    // ✅ IMPLEMENTAR: Toggle save
    toggleSave: async (userId: string, episodeId: string): Promise<boolean> => {
        try {
            const saveRef = doc(db, 'saved', `${userId}_${episodeId}`);
            const saveDoc = await getDoc(saveRef);

            if (saveDoc.exists()) {
                // Unsave
                await deleteDoc(saveRef);
                return false;
            } else {
                // Save
                await setDoc(saveRef, {
                    userId,
                    episodeId,
                    createdAt: new Date()
                });
                return true;
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            throw error;
        }
    }
};

// =====================================================
// STORAGE SERVICES - IMPLEMENTAÇÃO COMPLETA
// =====================================================

export const storageService = {
    // Upload podcast cover
    uploadPodcastCover: async (file: Blob, podcastId: string): Promise<string> => {
        try {
            console.log('🔄 Iniciando upload da capa...');
            console.log('📁 Podcast ID:', podcastId);
            console.log('📊 File size:', file.size);
            console.log('📋 File type:', file.type);

            // Validar entrada
            if (!file) {
                throw new Error('Arquivo não fornecido');
            }

            if (!podcastId) {
                throw new Error('ID do podcast não fornecido');
            }

            // Gerar nome único do arquivo
            const timestamp = Date.now();
            const fileName = `cover-${timestamp}.jpg`;
            const filePath = `podcasts/${podcastId}/cover/${fileName}`;

            console.log('📂 Upload path:', filePath);

            // Criar referência
            const fileRef = ref(storage, filePath);
            console.log('✅ Referência criada');

            // Upload com metadata
            const metadata = {
                contentType: 'image/jpeg',
                customMetadata: {
                    'uploadedBy': 'podcast-app',
                    'podcastId': podcastId,
                    'timestamp': timestamp.toString()
                }
            };

            console.log('📤 Fazendo upload...');
            const uploadResult = await uploadBytes(fileRef, file, metadata);
            console.log('✅ Upload concluído:', uploadResult.metadata.fullPath);

            console.log('🔗 Obtendo URL de download...');
            const downloadURL = await getDownloadURL(fileRef);
            console.log('✅ URL obtida:', downloadURL);

            return downloadURL;
        } catch (error) {
            console.error('❌ Erro detalhado no upload:', error);
            throw error;
        }
    },

    // ✅ IMPLEMENTAR: Upload episode audio
    uploadEpisodeAudio: async (audioUri: string, podcastId: string, episodeId: string): Promise<string> => {
        try {
            console.log('🎵 Iniciando upload de áudio...');
            console.log('📁 Podcast ID:', podcastId);
            console.log('🎙️ Episode ID:', episodeId);
            console.log('📂 Audio URI:', audioUri);

            // 1. Converter URI para blob
            const response = await fetch(audioUri);
            if (!response.ok) {
                throw new Error('Falha ao carregar arquivo de áudio');
            }

            const blob = await response.blob();
            console.log('📊 Audio size:', blob.size, 'bytes');
            console.log('🎼 Audio type:', blob.type);

            // 2. Validar tamanho (máximo 100MB)
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (blob.size > maxSize) {
                throw new Error('Arquivo muito grande. Máximo permitido: 100MB');
            }

            // 3. Gerar nome único do arquivo
            const timestamp = Date.now();
            const fileName = `episode-${episodeId}-${timestamp}.m4a`;
            const filePath = `podcasts/${podcastId}/episodes/${fileName}`;

            console.log('📂 Upload path:', filePath);

            // 4. Criar referência no Storage
            const fileRef = ref(storage, filePath);

            // 5. Metadata do arquivo
            const metadata = {
                contentType: 'audio/mp4', // m4a = audio/mp4
                customMetadata: {
                    'uploadedBy': 'podcast-app',
                    'podcastId': podcastId,
                    'episodeId': episodeId,
                    'timestamp': timestamp.toString(),
                    'originalSize': blob.size.toString()
                }
            };

            // 6. Upload com progress tracking
            console.log('📤 Fazendo upload...');
            const uploadTask = uploadBytes(fileRef, blob, metadata);

            // Aguardar conclusão
            const uploadResult = await uploadTask;
            console.log('✅ Upload concluído:', uploadResult.metadata.fullPath);

            // 7. Obter URL de download
            console.log('🔗 Obtendo URL de download...');
            const downloadURL = await getDownloadURL(fileRef);
            console.log('✅ URL obtida:', downloadURL);

            return downloadURL;
        } catch (error) {
            console.error('❌ Erro no upload de áudio:', error);
            throw error;
        }
    },

    // ✅ IMPLEMENTAR: Delete episode audio
    deleteEpisodeAudio: async (audioUrl: string): Promise<void> => {
        try {
            console.log('🗑️ Deletando áudio:', audioUrl);
            const audioRef = ref(storage, audioUrl);
            await deleteObject(audioRef);
            console.log('✅ Áudio deletado com sucesso');
        } catch (error) {
            console.error('❌ Erro ao deletar áudio:', error);
            // Não quebrar o fluxo se não conseguir deletar
        }
    },

    // Upload user avatar
    uploadUserAvatar: async (file: Blob, userId: string): Promise<string> => {
        try {
            const fileName = `avatar-${Date.now()}.jpg`;
            const fileRef = ref(storage, `users/${userId}/avatar/${fileName}`);

            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);

            return downloadURL;
        } catch (error) {
            console.error('Error uploading user avatar:', error);
            throw error;
        }
    }
};

// =====================================================
// USER INTERACTION SERVICES
// =====================================================

export const userInteractionService = {
    // Follow/unfollow creator
    toggleFollow: async (userId: string, creatorId: string): Promise<boolean> => {
        try {
            const followRef = doc(db, 'follows', `${userId}_${creatorId}`);
            const followDoc = await getDoc(followRef);

            if (followDoc.exists()) {
                // Unfollow
                await deleteDoc(followRef);
                return false;
            } else {
                // Follow
                await setDoc(followRef, {
                    userId,
                    creatorId,
                    createdAt: new Date()
                });
                return true;
            }
        } catch (error) {
            console.error('Error toggling follow:', error);
            throw error;
        }
    },

    // Like/unlike episode
    toggleLike: async (userId: string, episodeId: string): Promise<boolean> => {
        try {
            const likeRef = doc(db, 'likes', `${userId}_${episodeId}`);
            const likeDoc = await getDoc(likeRef);

            if (likeDoc.exists()) {
                // Unlike
                await deleteDoc(likeRef);
                return false;
            } else {
                // Like
                await setDoc(likeRef, {
                    userId,
                    episodeId,
                    createdAt: new Date()
                });
                return true;
            }
        } catch (error) {
            console.error('Error toggling like:', error);
            throw error;
        }
    },

    // Save/unsave episode
    toggleSave: async (userId: string, episodeId: string): Promise<boolean> => {
        try {
            const saveRef = doc(db, 'saved', `${userId}_${episodeId}`);
            const saveDoc = await getDoc(saveRef);

            if (saveDoc.exists()) {
                // Unsave
                await deleteDoc(saveRef);
                return false;
            } else {
                // Save
                await setDoc(saveRef, {
                    userId,
                    episodeId,
                    createdAt: new Date()
                });
                return true;
            }
        } catch (error) {
            console.error('Error toggling save:', error);
            throw error;
        }
    }
};