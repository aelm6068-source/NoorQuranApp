import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Surah, SURAHS, toArabicDigits } from './SurahsData';

interface Props {
  lastReadSurah: Surah | null;
  openSurah: (surah: Surah) => void;
}

export default function HomeScreen({ lastReadSurah, openSurah }: Props) {
  return (
    <ScrollView style={styles.tabContent} contentContainerStyle={styles.homeContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageMainTitle}>نور القرآن</Text>
      <View style={styles.dailyVerseCard}>
        <Text style={styles.dailyVerseTag}>✨ آية اليوم</Text>
        <Text style={styles.dailyVerseText}>
          "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ"
        </Text>
        <Text style={styles.dailyVerseSource}>سورة الرعد - الآية ٢٨</Text>
      </View>

      {lastReadSurah && (
        <TouchableOpacity style={styles.lastReadCard} activeOpacity={0.8} onPress={() => openSurah(lastReadSurah)}>
          <View style={styles.lastReadInfo}>
            <View style={styles.lastReadTagContainer}>
              <Ionicons name="book" size={14} color="#2D6A4F" />
              <Text style={styles.lastReadTag}> مواصلة القراءة</Text>
            </View>
            <Text style={styles.lastReadSurahName}>سورة {lastReadSurah.name}</Text>
            <Text style={styles.lastReadSubText}>
              {lastReadSurah.type} • {toArabicDigits(lastReadSurah.totalVerses)} آية
            </Text>
          </View>
          <View style={styles.continueBtn}>
            <Text style={styles.continueBtnText}>اقرأ الآن</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.quickAccessSection}>
        <TouchableOpacity style={styles.quickCard} onPress={() => openSurah(SURAHS[0])}>
          <Ionicons name="star" size={28} color="#D4AF37" style={{ marginBottom: 6 }} />
          <Text style={styles.quickCardTitle}>سورة الفاتحة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickCard} onPress={() => openSurah(SURAHS[35])}>
          <Ionicons name="heart" size={28} color="#2D6A4F" style={{ marginBottom: 6 }} />
          <Text style={styles.quickCardTitle}>سورة يس</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabContent: { flex: 1, paddingTop: 10 },
  homeContent: { paddingHorizontal: 18, paddingBottom: 90 },
  pageMainTitle: { fontSize: 24, fontWeight: 'bold', color: '#1B4332', textAlign: 'center', marginVertical: 12 },
  dailyVerseCard: { backgroundColor: '#1B4332', borderRadius: 16, padding: 20, marginBottom: 16, elevation: 3 },
  dailyVerseTag: { color: '#D8F3DC', fontSize: 13, fontWeight: 'bold', marginBottom: 8, textAlign: 'right' },
  dailyVerseText: { color: '#FFFFFF', fontSize: 20, textAlign: 'center', lineHeight: 34, marginVertical: 8, fontFamily: Platform.OS === 'ios' ? 'Traditional Arabic' : 'serif' },
  dailyVerseSource: { color: '#B7E4C7', fontSize: 12, textAlign: 'left', marginTop: 4 },
  lastReadCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2D7C5', marginBottom: 16 },
  lastReadInfo: { alignItems: 'flex-end' },
  lastReadTagContainer: { flexDirection: 'row-reverse', alignItems: 'center', marginBottom: 4 },
  lastReadTag: { fontSize: 12, color: '#2D6A4F', fontWeight: 'bold' },
  lastReadSurahName: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  lastReadSubText: { fontSize: 12, color: '#718096', marginTop: 2 },
  continueBtn: { backgroundColor: '#2D6A4F', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10 },
  continueBtnText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  quickAccessSection: { flexDirection: 'row-reverse', justifyContent: 'space-between', gap: 12 },
  quickCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#EAE3D2' },
  quickCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#2D3748' },
});
