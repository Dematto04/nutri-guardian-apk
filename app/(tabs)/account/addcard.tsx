import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CARD_WIDTH = Dimensions.get('window').width - 32;
const CARD_HEIGHT = 160;

function AddCardScreen() {
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [saveCard, setSaveCard] = useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32, paddingHorizontal: 16 }} showsVerticalScrollIndicator={false}>
      {/* Card Preview */}
      <View style={styles.cardPreview}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={styles.cardLogoCircle}>
            <MaterialCommunityIcons name="credit-card" size={32} color="#fff" />
          </View>
        </View>
        <Text style={styles.cardNumberPreview}>{number ? number.replace(/(.{4})/g, '$1 ').trim() : 'XXXX XXXX XXXX 8790'}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 }}>
          <View>
            <Text style={styles.cardLabel}>CARD HOLDER</Text>
            <Text style={styles.cardValue}>{name || 'RUSSELL AUSTIN'}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>EXPIRES</Text>
            <Text style={styles.cardValue}>{expiry || '01/22'}</Text>
          </View>
        </View>
      </View>
      {/* Input Fields */}
      <View style={styles.inputRow}>
        <FontAwesome5 name="user" size={18} color="#A0A0A0" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Name on the card"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#A0A0A0"
        />
      </View>
      <View style={styles.inputRow}>
        <MaterialCommunityIcons name="credit-card-outline" size={18} color="#A0A0A0" style={styles.inputIcon} />
        <TextInput
          style={styles.input}
          placeholder="Card number"
          value={number}
          onChangeText={setNumber}
          keyboardType="numeric"
          placeholderTextColor="#A0A0A0"
        />
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <View style={[styles.inputRow, { flex: 1 }]}> 
          <MaterialCommunityIcons name="calendar" size={18} color="#A0A0A0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Month / Year"
            value={expiry}
            onChangeText={setExpiry}
            placeholderTextColor="#A0A0A0"
          />
        </View>
        <View style={[styles.inputRow, { flex: 1 }]}> 
          <Ionicons name="lock-closed-outline" size={18} color="#A0A0A0" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="CVV"
            value={cvv}
            onChangeText={setCvv}
            keyboardType="numeric"
            placeholderTextColor="#A0A0A0"
          />
        </View>
      </View>
      {/* Save Switch */}
      <View style={styles.switchRow}>
        <Switch value={saveCard} onValueChange={setSaveCard} trackColor={{ true: '#7DE1EF', false: '#C4C4C4' }} />
        <Text style={styles.switchLabel}>Save this card</Text>
      </View>
      {/* Add Card Button */}
      <TouchableOpacity style={styles.addBtn}>
        <Text style={styles.addBtnText}>Add Credit Card</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 0,
  },
  cardPreview: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#46C5DF',
    borderRadius: 16,
    alignSelf: 'center',
    marginTop: 16,
    marginBottom: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardNumberPreview: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 18,
    marginBottom: 8,
  },
  cardLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
    opacity: 0.8,
  },
  cardValue: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 24,
    marginLeft: 4,
  },
  switchLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: '600',
    marginLeft: 10,
  },
  addBtn: {
    backgroundColor: '#F2F3F2',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#46C5DF',
    fontSize: 17,
    fontWeight: '600',
  },
});

export default AddCardScreen; 