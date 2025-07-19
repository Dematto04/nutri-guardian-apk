import { Colors } from "@/constants/Colors";
import { StyleSheet } from "react-native";

// Styles
export const mealPlanEntryDrawerStyles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: 500
  },
  listContainer: {
    paddingVertical: 8,
    flexGrow: 1,

  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },

  // Skeleton styles
  skeletonContainer: {
    paddingVertical: 8,
  },
  skeletonCard: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  skeletonHeader: {
    height: 20,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 12,
    width: "70%",
  },
  skeletonLine: {
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 8,
    width: "100%",
  },
  skeletonLineShort: {
    height: 14,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 16,
    width: "60%",
  },
  skeletonFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  skeletonCircle: {
    width: 24,
    height: 24,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
  },
  skeletonStats: {
    height: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    width: "40%",
  },

  // Meal plan card styles
  mealPlanCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedCard: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: "#F0F9FF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    marginRight: 12,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioButtonSelected: {
    borderColor: Colors.primary,
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  mealPlanName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    flex: 1,
    lineHeight: 22,
  },
  dateRange: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  notes: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 16,
    lineHeight: 20,
    fontStyle: "italic",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: "#E5E7EB",
    marginHorizontal: 16,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    marginRight: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    minWidth: 35,
    textAlign: "right",
  },

  // Footer styles
  footerButtons: {
    flexDirection: "row",
    width: "100%",
  },
  confirmButton: {
    backgroundColor: Colors.primary,
  },
  disabledButton: {
    backgroundColor: "#9CA3AF",
  },
});