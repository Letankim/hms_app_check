import { useContext,useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native"
import Loading from "components/Loading";
import { showErrorFetchAPI,showErrorMessage,showSuccessMessage } from "utils/toastUtil";
import { LinearGradient } from "expo-linear-gradient"
import { apiUserPaymentService } from "services/apiUserPaymentService"
import { AuthContext } from "context/AuthContext"
import { Ionicons,MaterialCommunityIcons } from "@expo/vector-icons"
import DynamicStatusBar from "screens/statusBar/DynamicStatusBar"
import { StatusBar } from "expo-status-bar"
import { SafeAreaView } from "react-native-safe-area-context"

const PaymentScreen = ({ route,navigation }) => {
  const { packageId,packageName,price,trainerId,trainerFullName } = route.params
  const { user } = useContext(AuthContext);
  const [loading,setLoading] = useState(false)
  const [termsAccepted,setTermsAccepted] = useState(false)

  const formattedPrice = price ? price.toLocaleString("en-US") : "N/A"

  const handleConfirmPayment = async () => {
    if (!user?.userId) {
      showErrorMessage("Please log in to continue with payment.");
      return;
    }

    if (!termsAccepted) {
      showErrorMessage("Please accept the terms and conditions to proceed.");
      return;
    }

    setLoading(true);
    try {
      const paymentData = {
        packageId: packageId,
        paymentMethod: "BankTransfer"
      };

      const response = await apiUserPaymentService.subscribeToPackage(paymentData);
      if (response.statusCode === 201) {
        showSuccessMessage("Payment request created. Please complete the payment.");
        navigation.navigate("QRPaymentScreen",{
          amount: price || 0,
          packageName: packageName,
          paymentUrl: response.data.paymentLink
        });
      } else {
        showErrorMessage(response.message || "Unable to process payment request.");
      }
    } catch (error) {
      showErrorFetchAPI(error);
    } finally {
      setLoading(false);
    }
  }

  const toggleTermsAcceptance = () => {
    setTermsAccepted(!termsAccepted)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <DynamicStatusBar backgroundColor="#FFFFFF" />
      {loading && <Loading />}
      {!loading && (
        <>
          {/* Header */}
          <View style={[styles.header,{ backgroundColor: '#FFFFFF' }]}>
            <TouchableOpacity style={[styles.backBtn,{ backgroundColor: '#F1F5F9' }]} onPress={() => navigation.goBack()} disabled={loading}>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={[styles.headerTitle,{ color: '#1E293B' }]}>Secure Payment</Text>
              <Text style={[styles.headerSubtitle,{ color: '#64748B' }]}>Complete your purchase</Text>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.securityBadge,{ backgroundColor: '#F1F5F9' }]}>
                <Ionicons name="shield-checkmark" size={16} color="#3B82F6" />
              </View>
            </View>
          </View>

          <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
            {/* Package Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="receipt-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.cardHeaderTitle}>Order Summary</Text>
              </View>

              <View style={styles.packageInfo}>
                <View style={[styles.packageIconContainer,{ backgroundColor: '#F1F5F9' }]}>
                  <MaterialCommunityIcons name="dumbbell" size={32} color="#3B82F6" />
                </View>
                <View style={styles.packageDetails}>
                  <Text style={styles.packageName}>{packageName || "Fitness Package"}</Text>
                  <Text style={styles.packageTrainer}>Personal Trainer: {trainerFullName || "Professional Coach"}</Text>
                  <View style={styles.packageBadge}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.packageBadgeText}>Premium Package</Text>
                  </View>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.priceBreakdown}>
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Package Price</Text>
                  <Text style={styles.priceValue}>${formattedPrice}</Text>
                </View>

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Amount</Text>
                  <Text style={[styles.totalValue,{ color: '#1E3A8A' }]}>${formattedPrice}</Text>
                </View>
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.paymentMethodCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="card-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.cardHeaderTitle}>Payment Method</Text>
              </View>

              <View style={styles.paymentMethodItem}>
                <View style={[styles.paymentMethodIcon,{ backgroundColor: '#F1F5F9' }]}>
                  <Ionicons name="business-outline" size={24} color="#3B82F6" />
                </View>
                <View style={styles.paymentMethodContent}>
                  <Text style={styles.paymentMethodTitle}>Bank Transfer</Text>
                  <Text style={styles.paymentMethodSubtitle}>Secure bank-to-bank transfer</Text>
                </View>
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
              </View>

              <View style={styles.paymentNote}>
                <Ionicons name="information-circle-outline" size={16} color="#3B82F6" />
                <Text style={[styles.paymentNoteText,{ color: '#64748B' }]}>
                  Bank transfer details will be provided after payment confirmation.
                </Text>
              </View>
            </View>

            {/* Transaction Info */}
            <View style={styles.transactionCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderIcon}>
                  <Ionicons name="document-text-outline" size={20} color="#3B82F6" />
                </View>
                <Text style={styles.cardHeaderTitle}>Transaction Information</Text>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Date & Time</Text>
                  <Text style={styles.infoValue}>
                    {new Date().toLocaleDateString("en-US",{
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Awaiting Payment</Text>
                  </View>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Processing Time</Text>
                  <Text style={styles.infoValue}>1-2 business days</Text>
                </View>
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsCard}>
              <TouchableOpacity style={styles.termsCheckboxContainer} onPress={toggleTermsAcceptance} activeOpacity={0.7}>
                <View style={[styles.checkbox,termsAccepted && styles.checkboxChecked]}>
                  {termsAccepted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </View>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    I agree to the <Text style={[styles.termsLink,{ color: '#3B82F6' }]}>Terms of Service</Text>,{" "}
                    <Text style={[styles.termsLink,{ color: '#3B82F6' }]}>Privacy Policy</Text>, and{" "}
                    <Text style={[styles.termsLink,{ color: '#3B82F6' }]}>Payment Terms</Text>
                  </Text>
                  <Text style={styles.termsSubtext}>
                    By proceeding, you acknowledge that you have read and understood our policies.
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.confirmButton,(!termsAccepted || loading) && styles.confirmButtonDisabled]}
                onPress={handleConfirmPayment}
                disabled={!termsAccepted || loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={termsAccepted && !loading ? ["#3B82F6","#1E3A8A"] : ["#94A3B8","#CBD5E1"]}
                  style={styles.confirmButtonGradient}
                >
                  <Ionicons name="card-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel Order</Text>
              </TouchableOpacity>
            </View>

            {/* Security Notice */}
            <View style={styles.securityContainer}>
              <LinearGradient colors={["#EFF6FF","#F8FAFC"]} style={styles.securityContent}>
                <Ionicons name="shield-checkmark" size={20} color="#10B981" />
                <View style={styles.securityTextContainer}>
                  <Text style={styles.securityTitle}>Secure & Protected</Text>
                  <Text style={styles.securityText}>
                    Your payment information is encrypted and secure. We use industry-standard security measures.
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Support Info */}
            <View style={styles.supportContainer}>
              <Text style={styles.supportTitle}>Need Help?</Text>
              <Text style={styles.supportText}>
                Contact our support team at 3docorp@gmail.com or call +84 865341745
              </Text>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 16 : 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1E293B",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 2,
  },
  headerRight: {
    width: 44,
    alignItems: "center",
  },
  securityBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    marginTop: 15,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    margin: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0,height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardHeaderIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  cardHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  packageInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  packageIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#F1F5F9",
  },
  packageDetails: {
    flex: 1,
  },
  packageName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  packageTrainer: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 8,
  },
  packageBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
    gap: 4,
  },
  packageBadgeText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 20,
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "500",
  },
  priceValue: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  totalValue: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1E3A8A",
  },
  paymentMethodCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0,height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#3B82F6",
    marginBottom: 16,
  },
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    backgroundColor: "#F1F5F9",
  },
  paymentMethodContent: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: "#64748B",
  },
  selectedIndicator: {
    marginLeft: 12,
  },
  paymentNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#EFF6FF",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  paymentNoteText: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    fontWeight: "500",
  },
  transactionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0,height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#F59E0B",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  termsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0,height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  termsCheckboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: "#3B82F6",
    borderColor: "#3B82F6",
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: 15,
    color: "#1E293B",
    lineHeight: 22,
    marginBottom: 8,
  },
  termsLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
  termsSubtext: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  confirmButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0,height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  confirmButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonGradient: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 12,
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  cancelButton: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  securityContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  securityContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    gap: 16,
  },
  securityTextContainer: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  securityText: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
  },
  supportContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0,height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 40,
  },
})

export default PaymentScreen