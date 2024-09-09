import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Button,
  TextInput,
  Text,
  Modal,
  Alert,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image,
  Dimensions,
  useWindowDimensions
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

const App = () => {
  const systemTheme = useColorScheme();
  const { width, height } = useWindowDimensions();
  const [goals, setGoals] = useState([]);
  const [deletedGoals, setDeletedGoals] = useState([]);
  const [goalInput, setGoalInput] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [deletedModalVisible, setDeletedModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');
  const [searchInput, setSearchInput] = useState('');
  const [isPortrait, setIsPortrait] = useState(height >= width);

  useEffect(() => {
    const handleOrientationChange = ({ window }) => {
      setIsPortrait(window.height >= window.width);
    };

    const subscription = Dimensions.addEventListener('change', handleOrientationChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const handleAddGoal = () => {
    if (goalInput.trim().length > 0) {
      setGoals((currentGoals) => [
        ...currentGoals,
        { id: Math.random().toString(), text: goalInput, completed: false }
      ]);
      setGoalInput('');
      setModalVisible(false);
    }
  };

  const handleEditGoal = () => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === editingGoal.id ? { ...goal, text: goalInput } : goal
      )
    );
    setGoalInput('');
    setEditingGoal(null);
    setModalVisible(false);
  };

  const startEditGoal = (goal) => {
    setGoalInput(goal.text);
    setEditingGoal(goal);
    setModalVisible(true);
  };

  const handleRemoveGoal = (goalId) => {
    const goalToDelete = goals.find((goal) => goal.id === goalId);
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            setGoals((currentGoals) =>
              currentGoals.filter((goal) => goal.id !== goalId)
            );
            setDeletedGoals((currentDeletedGoals) => [
              ...currentDeletedGoals,
              goalToDelete
            ]);
          },
          style: 'destructive'
        }
      ]
    );
  };

  const toggleGoalCompleted = (goalId) => {
    setGoals((currentGoals) =>
      currentGoals.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  const handleRestoreGoal = (goalId) => {
    const goalToRestore = deletedGoals.find((goal) => goal.id === goalId);
    setGoals((currentGoals) => [...currentGoals, goalToRestore]);
    setDeletedGoals((currentDeletedGoals) =>
      currentDeletedGoals.filter((goal) => goal.id !== goalId)
    );
  };

  const handleRemoveAllCompleted = () => {
    Alert.alert(
      'Confirm Delete All',
      'Are you sure you want to delete all completed goals?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          onPress: () => {
            setGoals((currentGoals) =>
              currentGoals.filter((goal) => !goal.completed)
            );
          },
          style: 'destructive'
        }
      ]
    );
  };

  const handleSearchGoals = (text) => {
    setSearchInput(text);
  };

  const filteredGoals = goals.filter((goal) =>
    goal.text.toLowerCase().includes(searchInput.toLowerCase())
  );

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  const closeApp = () => {
    Alert.alert('Close App', 'Are you sure you want to close the app?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Close', onPress: () => console.log('App closed!'), style: 'destructive' }
    ]);
  };

  return (
    <View
      style={[
        styles.container,
        isDarkMode ? styles.darkContainer : styles.lightContainer
      ]}
    >
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#2C2C2C' : '#F8F9FA'}
      />
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity>
          <Icon name="bars" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Today: 17 October</Text>
        <TouchableOpacity onPress={toggleTheme}>
          <Icon name="moon" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={closeApp}>
          <Icon name="power-off" size={24} color="red" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <TextInput
        placeholder="Search for goals..."
        style={styles.searchInput}
        value={searchInput}
        onChangeText={handleSearchGoals}
      />

      {/* Task List */}
      <FlatList
        data={filteredGoals}
        renderItem={({ item }) => (
          <View style={styles.goalItemContainer}>
            <Text style={item.completed ? styles.completedGoal : null}>
              {item.text}
            </Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity onPress={() => toggleGoalCompleted(item.id)}>
                <Icon
                  name={item.completed ? 'check-square' : 'square'}
                  size={20}
                  color="#007BFF"
                />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleRemoveGoal(item.id)}>
                <Icon name="trash" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />

      {/* Add New Task Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <TextInput
            placeholder="Enter your task..."
            style={styles.textInput}
            value={goalInput}
            onChangeText={setGoalInput}
          />
          <View style={styles.modalButtons}>
            <Button
              title={!editingGoal ? 'Add' : 'Update'}
              onPress={!editingGoal ? handleAddGoal : handleEditGoal}
            />
            <Button
              title="Cancel"
              color="red"
              onPress={() => {
                setModalVisible(false);
                setGoalInput('');
                setEditingGoal(null);
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Deleted Goals Modal */}
      <Modal visible={deletedModalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Deleted Goals</Text>
          <FlatList
            data={deletedGoals}
            renderItem={({ item }) => (
              <View style={styles.deletedGoalItemContainer}>
                <Text>{item.text}</Text>
                <TouchableOpacity
                  onPress={() => handleRestoreGoal(item.id)}
                  style={styles.restoreButton}
                >
                  <Text style={styles.restoreButtonText}>Restore</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item) => item.id}
          />
          <Button
            title="Close"
            onPress={() => setDeletedModalVisible(false)}
          />
        </View>
      </Modal>

      {/* Image */}
      <Image
        source={require("./assets/avt.jpg")} // Thay bằng URL hình ảnh của bạn
        style={{
          width: width * 0.8, // 80% chiều rộng màn hình
          height: isPortrait ? (width * 0.8) * (3 / 4) : (width * 0.8) * (1 / 4), // Điều chỉnh chiều cao trong chế độ ngang
          alignSelf: 'center', // Căn giữa hình ảnh theo chiều ngang
          marginVertical: 20 // Tuỳ chọn: Thêm một chút khoảng cách
        }}
        resizeMode="contain" // Điều chỉnh cách hình ảnh vừa với kích thước
      />

      {/* Footer */}
      <View
        style={[
          styles.footer,
          { bottom: isPortrait ? 40 : 20 } // Điều chỉnh vị trí chân trang dựa trên hướng màn hình
        ]}
      >
        <TouchableOpacity
          style={[
            styles.addButton,
            { width: isPortrait ? width * 0.25 : width * 0.2, height: isPortrait ? width * 0.25 : width * 0.2 } // Điều chỉnh kích thước nút theo hướng màn hình
          ]}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.deleteAllButton,
            { fontSize: isPortrait ? 16 : 20 } // Tăng kích thước chữ cho nút trong chế độ ngang
          ]}
          onPress={handleRemoveAllCompleted}
        >
          <Icon name="trash" size={24} color="red" />
          <Text style={styles.deleteAllText}>Delete All</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewDeletedButton,
            { fontSize: isPortrait ? 16 : 20 } // Tăng kích thước chữ cho nút trong chế độ ngang
          ]}
          onPress={() => setDeletedModalVisible(true)}
        >
          <Icon name="eye" size={24} color="blue" />
          <Text style={styles.viewDeletedText}>View Deleted</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  lightContainer: {
    backgroundColor: '#F8F9FA'
  },
  darkContainer: {
    backgroundColor: '#2C2C2C'
  },
  headerContainer: {
    backgroundColor: '#007BFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 50
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  searchInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    margin: 10,
    borderRadius: 5
  },
  goalItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  completedGoal: {
    textDecorationLine: 'line-through',
    color: '#888'
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 50
  },
  textInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    borderRadius: 5,
    width: '80%',
    marginBottom: 10
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20
  },
  deletedGoalItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc'
  },
  restoreButton: {
    backgroundColor: 'green',
    padding: 5,
    borderRadius: 5
  },
  restoreButtonText: {
    color: '#FFF'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '60%'
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    right: 20,
    alignItems: 'center'
  },
  addButton: {
    backgroundColor: '#007BFF',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 30
  },
  deleteAllButton: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  deleteAllText: {
    color: 'red',
    marginLeft: 5
  },
  viewDeletedButton: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center'
  },
  viewDeletedText: {
    color: 'blue',
    marginLeft: 5
  }
});

export default App;
