import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, StatusBar, TextInput, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SURAHS, Surah, toArabicDigits } from './SurahsData';
import HomeScreen from './HomeScreen';
import QuranReader from './QuranReader';

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'quran'>('home');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [lastReadSurah, setLastReadSurah] = useState<Surah | null>(SURAHS[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const openSurah = (surah: Surah) => {
    setSelectedSurah(surah);
    setLastReadSurah(surah);
  };

  const goToNextSurah = () => {
    if (!selectedSurah) return;
    const nextId = selectedSurah.id + 1;
    if (nextId <= 114) {
      const nextSurah = SURAHS.find((s) => s.id === nextId);
      if (nextSurah) openSurah(nextSurah);
    }
  };

  const filteredSurahs = SURAHS.filter(
    (s) => s.name.includes(searchQuery.trim()) || s.id.toString() === searchQuery.trim()
  );

  const renderSurahItem = ({ item }: { item: Surah }) => (
    <TouchableOpacity style={styles.surahCard} activeOpacity={0.7} onPress={() => openSurah(item)}>
      <View style={styles.surahRightInfo}>
        <View style={styles.surahNumberBadge}>
          <Text style={styles.surahNumberText}>{toArabicDigits(item.id)}</Text>
        </View>
        <View style={styles.surahTitleWrapper}>
          <Text style={styles.surahNameText}>سورة {item.name}</Text>
          <Text style={styles.surahMeta}>
            {item.type} • {toArabicDigits(item.totalVerses)} آية
          </Text>
        </View>
      </View>
      <Ionicons name="chevron-back" size={20} color="#A0AEC0" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF6F0" />

      {selectedSurah ? (
        <QuranReader 
          selectedSurah={selectedSurah} 
          onClose={() => setSelectedSurah(null)} 
          goToNextSurah={goToNextSurah} 
        />
      ) : activeTab === 'quran' ? (
        <View style={styles.tabContent}>
          <Text style={styles.pageMainTitle}>القرآن الكريم</Text>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث باسم السورة أو رقمها..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
          <FlatList
            data={filteredSurahs}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderSurahItem}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <HomeScreen lastReadSurah={lastReadSurah} openSurah={openSurah} />
      )}

      {!selectedSurah && (
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
            <Ionicons name={activeTab === 'home' ? 'home' : 'home-outline'} size={24} color={activeTab === 'home' ? '#1B4332' : '#718096'} />
            <Text style={[styles.navLabel, activeTab === 'home' && styles.activeNavLabel]}>الرئيسية</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('quran')}>
            <Ionicons name={activeTab === 'quran' ? 'book' : 'book-outline'} size={24} color={activeTab === 'quran' ? '#1B4332' : '#718096'} />
            <Text style={[styles.navLabel, activeTab === 'quran' && styles.activeNavLabel]}>القرآن</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  tabContent: { flex: 1, paddingTop: 10 },
  pageMainTitle: { fontSize: 24, fontWeight: 'bold', color: '#1B4332', textAlign: 'center', marginVertical: 12 },
  searchContainer: { paddingHorizontal: 16, marginBottom: 10 },
  searchBox: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E2D7C5', paddingHorizontal: 12 },
  searchIcon: { marginLeft: 8 },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 15, textAlign: 'right', color: '#222' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 90 },
  surahCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#EAE3D2', elevation: 2 },
  surahRightInfo: { flexDirection: 'row-reverse', alignItems: 'center' },
  surahNumberBadge: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#2D6A4F', justifyContent: 'center', alignItems: 'center', marginLeft: 14 },
  surahNumberText: { fontSize: 15, fontWeight: 'bold', color: '#1B4332' },
  surahTitleWrapper: { alignItems: 'flex-end' },
  surahNameText: { fontSize: 18, fontWeight: 'bold', color: '#2D3748' },
  surahMeta: { fontSize: 13, color: '#718096', marginTop: 2 },
  bottomNav: { flexDirection: 'row', height: 65, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EAE3D2', position: 'absolute', bottom: 0, left: 0, right: 0, paddingBottom: Platform.OS === 'ios' ? 15 : 0 },
  navItem: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navLabel: { fontSize: 12, color: '#718096', marginTop: 4 },
  activeNavLabel: { color: '#1B4332', fontWeight: 'bold' },
});
