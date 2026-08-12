import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Surah, RECITERS, OReciter, toArabicDigits, formatSurahId } from './SurahsData';
import quranData from './quran.json';

type QuranJsonType = {
  [key: string]: Array<{ chapter: number; verse: number; text: string; }>;
};

interface Props {
  selectedSurah: Surah;
  onClose: () => void;
  goToNextSurah: () => void;
}

export default function QuranReader({ selectedSurah, onClose, goToNextSurah }: Props) {
  const [fontSize, setFontSize] = useState(24);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [viewMode, setViewMode] = useState<'mushaf' | 'cards'>('cards');
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(1);

  // Audio States
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<OReciter>(RECITERS[0]);
  const [showReciterModal, setShowReciterModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollY = useRef(0);

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  useEffect(() => {
    stopAudio();
    setIsAutoScrolling(false);
    scrollY.current = 0;
  }, [selectedSurah, selectedReciter]);

  const stopAudio = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }
  };

  const loadAndPlayAudio = async () => {
    setIsLoadingAudio(true);
    try {
      if (sound) await sound.unloadAsync();
      const url = `${selectedReciter.server}${formatSurahId(selectedSurah.id)}.mp3`;
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      setSound(newSound);
      setIsPlaying(true);
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) setIsPlaying(false);
      });
    } catch (error) {
      console.log('Error playing audio', error);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const togglePlayback = async () => {
    if (!sound) { await loadAndPlayAudio(); return; }
    if (isPlaying) { await sound.pauseAsync(); setIsPlaying(false); } 
    else { await sound.playAsync(); setIsPlaying(true); }
  };

  useEffect(() => {
    let interval: any;
    if (isAutoScrolling) {
      interval = setInterval(() => {
        scrollY.current += scrollSpeed * 0.5;
        scrollViewRef.current?.scrollTo({ y: scrollY.current, animated: false });
      }, 30);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isAutoScrolling, scrollSpeed]);

  const currentVerses = (quranData as unknown as QuranJsonType)[selectedSurah.id.toString()] || [];

  return (
    <View style={styles.readerContainer}>
      <View style={styles.readerHeader}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => { stopAudio(); onClose(); }}>
          <Ionicons name="arrow-forward" size={26} color="#1B4332" />
        </TouchableOpacity>

        <View style={styles.headerTitleContainer}>
          <Text style={styles.surahTitleText}>سورة {selectedSurah.name}</Text>
          <Text style={styles.surahSubtitleText}>
            {selectedSurah.type} • {toArabicDigits(selectedSurah.totalVerses)} آية
          </Text>
        </View>

        <View style={styles.headerIconsRow}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setViewMode(viewMode === 'mushaf' ? 'cards' : 'mushaf')}>
            <Ionicons name={viewMode === 'mushaf' ? 'grid-outline' : 'document-text-outline'} size={22} color="#1B4332" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconBtn} onPress={() => setIsBookmarked(!isBookmarked)}>
            <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color="#1B4332" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.versesScrollView}
        contentContainerStyle={styles.versesContainer}
        showsVerticalScrollIndicator={false}
        onScroll={(e) => { scrollY.current = e.nativeEvent.contentOffset.y; }}
        scrollEventThrottle={16}
      >
        {selectedSurah.id !== 1 && selectedSurah.id !== 9 && (
          <Text style={styles.bismillahText}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</Text>
        )}

        {viewMode === 'mushaf' ? (
          <Text style={[styles.quranParagraph, { fontSize, lineHeight: fontSize * 2.2 }]}>
            {currentVerses.map((v) => (
              <Text key={v.verse}>
                {v.text} <Text style={styles.verseNumberSymbol}>﴿{toArabicDigits(v.verse)}﴾ </Text>
              </Text>
            ))}
          </Text>
        ) : (
          <View>
            {currentVerses.map((v) => (
              <View key={v.verse} style={styles.verseCardItem}>
                <View style={styles.verseCardHeader}>
                  <View style={styles.verseCardBadge}>
                    <Text style={styles.verseCardBadgeText}>{toArabicDigits(v.verse)}</Text>
                  </View>
                </View>
                <Text style={[styles.verseCardText, { fontSize, lineHeight: fontSize * 2 }]}>{v.text}</Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.nextSurahFooterBtn} onPress={goToNextSurah}>
          <Text style={styles.nextSurahFooterText}>الانتقال للسورة التالية ⬅</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.readerBottomBar}>
        <TouchableOpacity style={[styles.autoScrollBtn, isAutoScrolling && styles.autoScrollActive]} onPress={() => setIsAutoScrolling(!isAutoScrolling)}>
          <Ionicons name={isAutoScrolling ? 'pause' : 'play'} size={20} color={isAutoScrolling ? '#FFFFFF' : '#1B4332'} />
          <Text style={[styles.autoScrollText, isAutoScrolling && { color: '#FFFFFF' }]}>{isAutoScrolling ? 'إيقاف' : 'تمرير'}</Text>
        </TouchableOpacity>

        {isAutoScrolling && (
          <View style={styles.speedSelector}>
            {[1, 2, 3].map((s) => (
              <TouchableOpacity key={s} style={[styles.speedOption, scrollSpeed === s && styles.speedOptionActive]} onPress={() => setScrollSpeed(s)}>
                <Text style={[styles.speedOptionText, scrollSpeed === s && { color: '#FFF' }]}>{s}x</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {!isAutoScrolling && (
          <View style={styles.fontControlsRow}>
            <TouchableOpacity style={styles.readerActionBtn} onPress={() => setFontSize(f => Math.min(f + 2, 40))}>
              <Ionicons name="add-circle-outline" size={22} color="#1B4332" />
              <Text style={styles.readerActionText}>تكبير</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.readerActionBtn} onPress={() => setFontSize(f => Math.max(f - 2, 18))}>
              <Ionicons name="remove-circle-outline" size={22} color="#1B4332" />
              <Text style={styles.readerActionText}>تصغير</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.readerActionBtn} onPress={() => setShowReciterModal(true)}>
              <Ionicons name="person-outline" size={22} color="#1B4332" />
              <Text style={styles.readerActionText}>القارئ</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.readerActionBtn} onPress={togglePlayback} disabled={isLoadingAudio}>
              {isLoadingAudio ? <ActivityIndicator size="small" color="#1B4332" /> : <Ionicons name={isPlaying ? "pause-circle-outline" : "volume-medium-outline"} size={22} color="#1B4332" />}
              <Text style={styles.readerActionText}>{isPlaying ? 'إيقاف' : 'استماع'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Modal visible={showReciterModal} transparent={true} animationType="slide" onRequestClose={() => setShowReciterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>اختر القارئ</Text>
              <TouchableOpacity onPress={() => setShowReciterModal(false)}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            {RECITERS.map((reciter) => (
              <TouchableOpacity key={reciter.id} style={[styles.reciterItem, selectedReciter.id === reciter.id && styles.reciterItemActive]} onPress={() => { setSelectedReciter(reciter); setShowReciterModal(false); }}>
                <Text style={[styles.reciterName, selectedReciter.id === reciter.id && styles.reciterNameActive]}>{reciter.name}</Text>
                {selectedReciter.id === reciter.id && <Ionicons name="checkmark-circle" size={24} color="#2D6A4F" />}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  readerContainer: { flex: 1, backgroundColor: '#FFFDF9' },
  readerHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: Platform.OS === 'android' ? 12 : 6, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#EAE3D2', backgroundColor: '#FAF6F0' },
  headerIconBtn: { padding: 8 },
  headerIconsRow: { flexDirection: 'row-reverse', alignItems: 'center' },
  headerTitleContainer: { alignItems: 'center' },
  surahTitleText: { fontSize: 18, fontWeight: 'bold', color: '#1B4332' },
  surahSubtitleText: { fontSize: 12, color: '#718096' },
  versesScrollView: { flex: 1 },
  versesContainer: { padding: 22, paddingBottom: 40 },
  bismillahText: { fontSize: 24, textAlign: 'center', color: '#1B4332', marginBottom: 24, fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif', fontWeight: 'bold' },
  quranParagraph: { textAlign: 'right', color: '#1A202C', fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif' },
  verseNumberSymbol: { color: '#2D6A4F', fontWeight: 'bold' },
  verseCardItem: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#EAE3D2', elevation: 1 },
  verseCardHeader: { flexDirection: 'row-reverse', marginBottom: 8 },
  verseCardBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 8, borderWidth: 1, borderColor: '#2D6A4F' },
  verseCardBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#1B4332' },
  verseCardText: { textAlign: 'right', color: '#1A202C', fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif' },
  nextSurahFooterBtn: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#2D6A4F', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  nextSurahFooterText: { color: '#1B4332', fontWeight: 'bold', fontSize: 15 },
  readerBottomBar: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EAE3D2' },
  autoScrollBtn: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#E8F5E9', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#2D6A4F' },
  autoScrollActive: { backgroundColor: '#1B4332' },
  autoScrollText: { fontSize: 13, color: '#1B4332', fontWeight: 'bold', marginRight: 6 },
  speedSelector: { flexDirection: 'row-reverse', gap: 6 },
  speedOption: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#F0EAD6', borderWidth: 1, borderColor: '#D4AF37' },
  speedOptionActive: { backgroundColor: '#2D6A4F' },
  speedOptionText: { fontWeight: 'bold', fontSize: 12, color: '#1B4332' },
  fontControlsRow: { flexDirection: 'row-reverse', gap: 12, flex: 1, justifyContent: 'flex-start', marginRight: 10 },
  readerActionBtn: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  readerActionText: { fontSize: 11, color: '#1B4332', marginTop: 2, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  modalHeader: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#EAE3D2' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1B4332' },
  reciterItem: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, borderRadius: 10, marginBottom: 8 },
  reciterItemActive: { backgroundColor: '#E8F5E9' },
  reciterName: { fontSize: 16, color: '#2D3748' },
  reciterNameActive: { color: '#1B4332', fontWeight: 'bold' },
});
