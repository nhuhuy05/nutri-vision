import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { FoodItem, MealType } from '../../types/nutrition';
import { getAllFoods, searchFoods } from '../../services/database';

export default function ManualEntryModal() {
  const params = useLocalSearchParams<{ defaultMealType?: MealType }>();
  const [keyword, setKeyword] = useState('');
  const [foodList, setFoodList] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFoods();
  }, [keyword]);

  const loadFoods = async () => {
    setIsLoading(true);
    try {
      if (keyword.trim()) {
        const results = await searchFoods(keyword);
        setFoodList(results);
      } else {
        const all = await getAllFoods();
        setFoodList(all);
      }
    } catch (e) {
      console.error('Error fetching foods:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFood = (item: FoodItem) => {
    router.push({
      pathname: '/modal/food-review',
      params: {
        foodId: item.id,
      },
    });
  };

  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBarContainer}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn (phở, bún, cơm, v.v.)..."
          value={keyword}
          onChangeText={setKeyword}
          autoFocus
          clearButtonMode="while-editing"
        />
        {keyword.length > 0 && (
          <TouchableOpacity onPress={() => setKeyword('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Results List */}
      <FlatList
        data={foodList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <Text style={styles.resultsHeader}>
            {keyword
              ? `Kết quả tìm kiếm (${foodList.length} món)`
              : `Danh mục món ăn Việt Nam (${foodList.length} món sẵn có offline)`}
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.foodRow}
            onPress={() => handleSelectFood(item)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodSub}>
                {item.category} • {item.servingUnit}
              </Text>
              <Text style={styles.macroPills}>
                🥩 {item.protein}g đạm • 🍚 {item.carbs}g carb • 🥑 {item.fat}g béo
              </Text>
            </View>

            <View style={styles.rightBadge}>
              <Text style={styles.caloriesNumber}>{item.calories}</Text>
              <Text style={styles.caloriesUnit}>kcal</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>
              Không tìm thấy món ăn nào khớp với từ khóa "{keyword}"
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 46,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  resultsHeader: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
    marginBottom: 10,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  foodSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  macroPills: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  rightBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  caloriesNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  caloriesUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
  },
});
