const mastercard = require("@/assets/images/mastercard.png");
const visa = require("@/assets/images/visa.png");
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const cardData = [
  {
    id: '1',
    type: 'Master Card',
    number: '5678',
    expiry: '01/22',
    cvv: '908',
    holder: 'Russell Austin',
    isDefault: true,
    brand: mastercard,
  },
  {
    id: '2',
    type: 'Visa Card',
    number: '5678',
    expiry: '01/22',
    cvv: '908',
    holder: 'Russell Austin',
    isDefault: false,
    brand: visa,
  },
  {
    id: '3',
    type: 'Master Card',
    number: '5678',
    expiry: '01/22',
    cvv: '908',
    holder: 'Russell Austin',
    isDefault: false,
    brand: mastercard,
  },
];

function MyCardsScreen() {
  const [expandedId, setExpandedId] = useState('1');
  const [makeDefault, setMakeDefault] = useState(true);
  const router = useRouter();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Default Card (Expanded) */}
        {cardData.filter(card => card.isDefault).map(card => (
          <View key={card.id} style={styles.cardWrapper}>
            <View style={[styles.cardHeaderRow, {paddingTop: 36}]}>
              <View style={styles.defaultLabel}><Text style={styles.defaultLabelText}>DEFAULT</Text></View>
              <Image source={card.brand} style={styles.cardBrand} />
              <View style={{ flex: 1 }}>
                <Text style={styles.cardType}>{card.type}</Text>
                <Text style={styles.cardNumber}>XXXX XXXX XXXX {card.number}</Text>
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                  <Text style={styles.cardInfo}>Expiry: <Text style={styles.cardInfoValue}>{card.expiry}</Text></Text>
                  <Text style={styles.cardInfo}>   CVV: <Text style={styles.cardInfoValue}>{card.cvv}</Text></Text>
                </View>
              </View>
              <Ionicons name="chevron-down" size={22} color="#222" style={{ marginLeft: 8 }} />
            </View>
            {/* Expanded details for default card */}
            <View style={styles.expandedSection}>
              <View style={styles.inputRow}>
                <FontAwesome5 name="user" size={18} color="#A0A0A0" style={styles.inputIcon} />
                <Text style={styles.inputText}>{card.holder}</Text>
              </View>
              <View style={styles.inputRow}>
                <MaterialCommunityIcons name="credit-card-outline" size={18} color="#A0A0A0" style={styles.inputIcon} />
                <Text style={styles.inputText}>XXXX XXXX XXXX {card.number}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={[styles.inputRow, { flex: 1 }]}> 
                  <MaterialCommunityIcons name="calendar" size={18} color="#A0A0A0" style={styles.inputIcon} />
                  <Text style={styles.inputText}>{card.expiry}</Text>
                </View>
                <View style={[styles.inputRow, { flex: 1 }]}> 
                  <Ionicons name="lock-closed-outline" size={18} color="#A0A0A0" style={styles.inputIcon} />
                  <Text style={styles.inputText}>{card.cvv}</Text>
                </View>
              </View>
              <View style={styles.switchRow}>
                <Switch value={makeDefault} onValueChange={setMakeDefault} trackColor={{ true: '#7DE1EF', false: '#C4C4C4' }} />
                <Text style={styles.switchLabel}>Make default</Text>
              </View>
            </View>
          </View>
        ))}
        {/* Other Cards (Collapsed) */}
        {cardData.filter(card => !card.isDefault).map(card => (
          <View key={card.id} style={styles.cardWrapper}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardBrandCircle}>
                <Image source={card.brand} style={styles.cardBrandSmall} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardType}>{card.type}</Text>
                <Text style={styles.cardNumber}>XXXX XXXX XXXX {card.number}</Text>
                <View style={{ flexDirection: 'row', marginTop: 2 }}>
                  <Text style={styles.cardInfo}>Expiry: <Text style={styles.cardInfoValue}>{card.expiry}</Text></Text>
                  <Text style={styles.cardInfo}>   CVV: <Text style={styles.cardInfoValue}>{card.cvv}</Text></Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#222" style={{ marginLeft: 8 }} />
            </View>
          </View>
        ))}
      </ScrollView>
      {/* Save Button */}
      <TouchableOpacity style={styles.saveBtn}>
        <Text style={styles.saveText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const CARD_RADIUS = 6;
const CARD_SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.04,
  shadowRadius: 4,
  elevation: 1,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    
  },
  cardWrapper: {
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    marginHorizontal: 16,
    marginTop: 20,
    ...CARD_SHADOW,
    padding: 0,
    overflow: 'hidden',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0,
  },
  defaultLabel: {
    backgroundColor: '#46C5DF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    position: 'absolute',
    top: 0
  },
  defaultLabelText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  cardBrand: {
    width: 36,
    height: 36,
    marginRight: 12,
    resizeMode: 'contain',
  },
  cardBrandCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardBrandSmall: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
  cardType: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
  },
  cardNumber: {
    fontSize: 13,
    color: '#A0A0A0',
    marginTop: 2,
  },
  cardInfo: {
    fontSize: 12,
    color: '#A0A0A0',
    marginRight: 8,
  },
  cardInfoValue: {
    color: '#222',
    fontWeight: '600',
  },
  expandedSection: {
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    marginTop: 0,
    padding: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  inputIcon: {
    marginRight: 10,
  },
  inputText: {
    fontSize: 14,
    color: '#222',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 10,
  },
  switchLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#F2F3F2',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 24,
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveText: {
    color: '#46C5DF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default MyCardsScreen; 