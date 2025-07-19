import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width } = Dimensions.get('window');

interface CookingStep {
  stepNumber: number;
  instruction: string;
  estimatedTimeMinutes: number;
}

interface CookingStepsScreenProps {
  instructions: CookingStep[];
  onStepComplete?: (stepNumber: number) => void;
}

const CookingSteps: React.FC<CookingStepsScreenProps> = ({
  instructions = [],
  onStepComplete,
}) => {
  const animatedValues = useRef(
    instructions.map(() => new Animated.Value(0))
  ).current;

  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());

  useEffect(() => {
    // Animate steps in sequence
    const animations = animatedValues.map((animValue, index) =>
      Animated.timing(animValue, {
        toValue: 1,
        duration: 600,
        delay: index * 200,
        useNativeDriver: true,
      })
    );

    Animated.stagger(100, animations).start();
  }, []);

  const handleStepPress = (stepNumber: number) => {
    const newCompletedSteps = new Set(completedSteps);
    if (completedSteps.has(stepNumber)) {
      newCompletedSteps.delete(stepNumber);
    } else {
      newCompletedSteps.add(stepNumber);
    }
    setCompletedSteps(newCompletedSteps);
    onStepComplete?.(stepNumber);
  };

  const getTotalTime = () => {
    return instructions.reduce((total, step) => total + step.estimatedTimeMinutes, 0);
  };

  if (!instructions || instructions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="restaurant-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>Chưa có hướng dẫn nấu ăn</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Hướng dẫn nấu ăn</Text>
        <View style={styles.totalTimeContainer}>
          <Ionicons name="time-outline" size={20} color={Colors.primary} />
          <Text style={styles.totalTimeText}>
            Tổng thời gian: {getTotalTime()} phút
          </Text>
        </View>
      </View>

      {/* Steps Container */}
      <View style={styles.stepsContainer}>
        {instructions.map((step, index) => {
          const isCompleted = completedSteps.has(step.stepNumber);
          const animatedStyle = {
            opacity: animatedValues[index],
            transform: [
              {
                translateY: animatedValues[index].interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          };

          return (
            <Animated.View key={step.stepNumber} style={[animatedStyle]}>
              <TouchableOpacity
                style={[
                  styles.stepCard,
                  isCompleted && styles.stepCardCompleted,
                ]}
                onPress={() => handleStepPress(step.stepNumber)}
                activeOpacity={0.7}
              >
                {/* Step Number Badge */}
                <View style={styles.stepHeader}>
                  <View style={[
                    styles.stepNumberBadge,
                    isCompleted && styles.stepNumberBadgeCompleted,
                  ]}>
                    {isCompleted ? (
                      <Ionicons name="checkmark" size={20} color="#FFF" />
                    ) : (
                      <Text style={styles.stepNumberText}>{step.stepNumber}</Text>
                    )}
                  </View>
                  
                  {/* Time Badge */}
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.timeText}>
                      {step.estimatedTimeMinutes} phút
                    </Text>
                  </View>
                </View>

                {/* Instruction Text */}
                <Text style={[
                  styles.instructionText,
                  isCompleted && styles.instructionTextCompleted,
                ]}>
                  {step.instruction}
                </Text>

                {/* Progress Indicator */}
                {index < instructions.length - 1 && (
                  <View style={[
                    styles.progressLine,
                    isCompleted && styles.progressLineCompleted,
                  ]} />
                )}

                {/* Completion Indicator */}
                {isCompleted && (
                  <View style={styles.completionOverlay}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Progress Summary */}
      <View style={styles.progressSummary}>
        <Text style={styles.progressText}>
          Hoàn thành: {completedSteps.size}/{instructions.length} bước
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressBarFill,
              {
                width: `${(completedSteps.size / instructions.length) * 100}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  headerContainer: {
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  totalTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  totalTimeText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  stepsContainer: {
    // paddingHorizontal: 20,
    paddingTop: 20,
  },
  stepCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  stepCardCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepNumberBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberBadgeCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    fontWeight: '500',
  },
  instructionTextCompleted: {
    color: '#666',
    textDecorationLine: 'line-through',
  },
  progressLine: {
    position: 'absolute',
    left: 39,
    bottom: -16,
    width: 2,
    height: 16,
    backgroundColor: '#E0E0E0',
  },
  progressLineCompleted: {
    backgroundColor: '#4CAF50',
  },
  completionOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  progressSummary: {
    backgroundColor: '#FFF',
    // marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  bottomSpacing: {
    height: 40,
  },
});

export default CookingSteps;