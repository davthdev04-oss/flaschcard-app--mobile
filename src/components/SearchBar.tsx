import React from "react";
import {
  View,
  TextInput,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
};

export default function SearchBar({
  value,
  onChangeText,
  sortValue,
  onSortChange,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
        />

        <TextInput
          style={styles.input}
          placeholder="Search..."
          value={value}
          onChangeText={onChangeText}
        />
      </View>

      <View style={styles.picker}>
        <Picker
          selectedValue={sortValue}
          onValueChange={onSortChange}
        >
          <Picker.Item label="A-Z" value="az" />
          <Picker.Item label="Z-A" value="za" />
        </Picker>
      </View>
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
  },

  searchBox: {
    flex: 1,

    height: 54,

    backgroundColor: "#FFF",

    borderRadius: 16,

    flexDirection: "row",

    alignItems: "center",

    paddingHorizontal: 14,

    borderWidth: 1,

    borderColor: "#E5E7EB",
  },

  input: {
    flex: 1,

    marginLeft: 10,

    fontSize: 16,
  },

  picker: {
    width: 100,

    height: 54,

    marginLeft: 10,

    borderRadius: 16,

    borderWidth: 1,

    borderColor: "#E5E7EB",

    overflow: "hidden",

    justifyContent: "center",
  },
});