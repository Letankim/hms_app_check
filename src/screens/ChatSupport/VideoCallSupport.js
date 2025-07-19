import { useState,useRef,useCallback,useContext } from "react"
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    StatusBar,
    ActivityIndicator,
    Platform,
    Dimensions,
} from "react-native"
import { WebView } from "react-native-webview"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { AuthContext } from "context/AuthContext"

const { width,height } = Dimensions.get("window")

const PRIMARY_COLOR = "#0056d2"
const ACCENT_COLOR = "#0EA5E9"
const TEXT_COLOR_DARK = "#1E293B"
const TEXT_COLOR_LIGHT = "#64748B"
const BACKGROUND_COLOR = "#F0F2F5"

export default function VideoCallSupport({ route,navigation }) {
    const { user } = useContext(AuthContext);
    const roomIdFromParams = route?.params?.roomId
    const [webViewLoading,setWebViewLoading] = useState(true)
    const [isInCall,setIsInCall] = useState(false)
    const webViewRef = useRef(null)

    const handleBack = useCallback(() => {
        if (isInCall) {
            Alert.alert("End Call","Are you sure you want to end the call?",[
                { text: "Cancel",style: "cancel" },
                {
                    text: "End Call",
                    style: "destructive",
                    onPress: () => {
                        if (navigation) {
                            navigation.goBack()
                        }
                    },
                },
            ])
        } else {
            if (navigation) {
                navigation.goBack()
            }
        }
    },[navigation,isInCall])

    const handleJoinCall = useCallback(() => {
        setIsInCall(true)
    },[])

    const handleEndCall = useCallback(() => {
        Alert.alert("End Call","Are you sure you want to end the call?",[
            { text: "Cancel",style: "cancel" },
            {
                text: "End Call",
                style: "destructive",
                onPress: () => {
                    setIsInCall(false)
                },
            },
        ])
    },[])

    const onWebViewLoadStart = useCallback(() => {
        setWebViewLoading(true)
    },[])

    const onWebViewLoadEnd = useCallback(() => {
        setWebViewLoading(false)
    },[])

    const onWebViewError = useCallback(() => {
        setWebViewLoading(false)
        Alert.alert("Error","Unable to load the video call")
    },[])

    const webViewProps = {
        ref: webViewRef,
        style: styles.webview,
        onLoadStart: onWebViewLoadStart,
        onLoadEnd: onWebViewLoadEnd,
        onError: onWebViewError,
        javaScriptEnabled: true,
        domStorageEnabled: true,
        startInLoadingState: true,
        scalesPageToFit: true,
        allowsInlineMediaPlayback: true,
        mediaPlaybackRequiresUserAction: false,
        allowsFullscreenVideo: true,
        mixedContentMode: "compatibility",
        thirdPartyCookiesEnabled: true,
        sharedCookiesEnabled: true,
        ...(Platform.OS === "ios" && {
            allowsLinkPreview: false,
            dataDetectorTypes: "none",
            scrollEnabled: false,
            bounces: false,
            automaticallyAdjustContentInsets: false,
            allowsBackForwardNavigationGestures: false,
        }),
        ...(Platform.OS === "android" && {
            mixedContentMode: "always",
            hardwareAccelerationDisabled: false,
        }),
    }

    if (!roomIdFromParams) {
        return (
            <View style={[styles.container,{ backgroundColor: isInCall ? "#000" : BACKGROUND_COLOR }]}>
                <StatusBar
                    barStyle={isInCall ? "light-content" : "dark-content"}
                    backgroundColor={isInCall ? "#000" : BACKGROUND_COLOR}
                />
                <View style={styles.fixedHeader}>
                    <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={24} color={TEXT_COLOR_DARK} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Video Call</Text>
                    <View style={styles.placeholder} />
                </View>
                <View style={styles.errorContent}>
                    <View style={styles.errorIconContainer}>
                        <Ionicons name="videocam-off" size={80} color="#ff4444" />
                    </View>
                    <Text style={styles.errorTitle}>No Room Available</Text>
                    <Text style={styles.errorMessage}>
                        Unable to join the video call. Room ID is required to start the session.
                    </Text>
                    <TouchableOpacity style={styles.errorButton} onPress={() => navigation?.goBack()} activeOpacity={0.8}>
                        <LinearGradient colors={[PRIMARY_COLOR,ACCENT_COLOR]} style={styles.errorButtonGradient}>
                            <Ionicons name="arrow-back" size={20} color="#fff" />
                            <Text style={styles.errorButtonText}>Go Back</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    const callURL = `https://3do-support.vercel.app/?roomID=${roomIdFromParams}&userID=${user?.userId}&userName=User${user?.userId}&autoJoin=true`;

    if (isInCall) {
        return (
            <View style={styles.containerInCall}>
                <StatusBar
                    barStyle={isInCall ? "light-content" : "dark-content"}
                    backgroundColor={isInCall ? "#000" : BACKGROUND_COLOR}
                />
                {/* Fixed Header for Call - Dark Theme */}
                <View style={styles.callHeader}>
                    <TouchableOpacity style={styles.callHeaderButton} onPress={handleBack} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.callHeaderCenter}>
                        <View style={styles.liveIndicator}>
                            <View style={styles.liveDot} />
                            <Text style={styles.liveText}>Live</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.callHeaderButton} onPress={handleEndCall} activeOpacity={0.7}>
                        <Ionicons name="call" size={24} color="#ff4444" />
                    </TouchableOpacity>
                </View>
                {/* WebView Container */}
                <View style={styles.webviewContainer}>
                    <WebView source={{ uri: callURL }} {...webViewProps} />
                    {/* Loading indicator */}
                    {webViewLoading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color="#007AFF" />
                            <Text style={styles.loadingText}>Connecting to call...</Text>
                        </View>
                    )}
                </View>
            </View>
        )
    }

    // Pre-call screen
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={BACKGROUND_COLOR} />
            {/* Fixed Header - Light Theme */}
            <View style={styles.fixedHeader}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={TEXT_COLOR_DARK} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Video Call</Text>
                <View style={styles.placeholder} />
            </View>
            {/* Main Content */}
            <View style={styles.preCallContent}>
                {/* Video Preview Card */}
                <View style={styles.previewCard}>
                    <LinearGradient
                        colors={[PRIMARY_COLOR,ACCENT_COLOR]}
                        start={{ x: 0,y: 0 }}
                        end={{ x: 1,y: 1 }}
                        style={styles.previewGradient}
                    >
                        <View style={styles.previewIconContainer}>
                            <Ionicons name="videocam" size={60} color="#fff" />
                        </View>
                        <Text style={styles.previewTitle}>Ready to Join</Text>
                        <Text style={styles.previewSubtitle}>Room ID: {roomIdFromParams}</Text>
                    </LinearGradient>
                </View>
                {/* Call Features */}
                <View style={styles.featuresContainer}>
                    <Text style={styles.featuresTitle}>Call Features</Text>
                    <View style={styles.featuresList}>
                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name="videocam" size={24} color={PRIMARY_COLOR} />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>HD Video Quality</Text>
                                <Text style={styles.featureDescription}>Crystal clear video calls</Text>
                            </View>
                        </View>
                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name="mic" size={24} color={PRIMARY_COLOR} />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>Clear Audio</Text>
                                <Text style={styles.featureDescription}>Noise cancellation enabled</Text>
                            </View>
                        </View>
                        <View style={styles.featureItem}>
                            <View style={styles.featureIcon}>
                                <Ionicons name="shield-checkmark" size={24} color={PRIMARY_COLOR} />
                            </View>
                            <View style={styles.featureText}>
                                <Text style={styles.featureTitle}>Secure Connection</Text>
                                <Text style={styles.featureDescription}>End-to-end encrypted</Text>
                            </View>
                        </View>
                    </View>
                </View>
                {/* Join Button */}
                <View style={styles.joinButtonContainer}>
                    <TouchableOpacity style={styles.joinButton} onPress={handleJoinCall} activeOpacity={0.8}>
                        <LinearGradient
                            colors={[PRIMARY_COLOR,ACCENT_COLOR]}
                            start={{ x: 0,y: 0 }}
                            end={{ x: 1,y: 0 }}
                            style={styles.joinButtonGradient}
                        >
                            <Ionicons name="videocam" size={24} color="#fff" />
                            <Text style={styles.joinButtonText}>Join Video Call</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    // Pre-call container - Light theme
    container: {
        flex: 1,
        backgroundColor: BACKGROUND_COLOR,
    },
    // In-call container - Dark theme
    containerInCall: {
        flex: 1,
        backgroundColor: "#000",
    },
    // Pre-call header - Light theme
    fixedHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#E2E8F0",
        ...Platform.select({
            ios: {
                paddingTop: 60,
                height: 100,
            },
            android: {
                paddingTop: 16,
                height: 70,
            },
        }),
    },
    // In-call header - Dark theme
    callHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#000",
        borderBottomWidth: 1,
        borderBottomColor: "#333",
        ...Platform.select({
            ios: {
                paddingTop: 60,
                height: 100,
            },
            android: {
                paddingTop: 16,
                height: 70,
            },
        }),
    },
    // Call header buttons - Dark theme
    callHeaderButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.15)",
        justifyContent: "center",
        alignItems: "center",
    },
    callHeaderCenter: {
        flex: 1,
        alignItems: "center",
    },
    liveIndicator: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ff4444",
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 16,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#fff",
        marginRight: 6,
    },
    liveText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#F8FAFC",
        alignItems: "center",
        justifyContent: "center",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: TEXT_COLOR_DARK,
        flex: 1,
        textAlign: "center",
    },
    placeholder: {
        width: 40,
    },
    webviewContainer: {
        flex: 1,
        backgroundColor: "#000",
        position: "relative",
    },
    webview: {
        flex: 1,
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.8)",
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        color: "#fff",
        fontSize: 18,
        marginTop: 16,
        fontWeight: "600",
    },
    // Pre-call Content
    preCallContent: {
        flex: 1,
        padding: 20,
    },
    previewCard: {
        marginTop: 20,
        marginBottom: 30,
        borderRadius: 20,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: PRIMARY_COLOR,
                shadowOffset: { width: 0,height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
            },
            android: {
                elevation: 12,
            },
        }),
    },
    previewGradient: {
        paddingVertical: 40,
        paddingHorizontal: 24,
        alignItems: "center",
    },
    previewIconContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    previewTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#fff",
        marginBottom: 8,
    },
    previewSubtitle: {
        fontSize: 16,
        color: "rgba(255,255,255,0.8)",
        fontWeight: "500",
    },
    featuresContainer: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOffset: { width: 0,height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    featuresTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: TEXT_COLOR_DARK,
        marginBottom: 16,
    },
    featuresList: {
        gap: 16,
    },
    featureItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    featureIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#F0F9FF",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 16,
    },
    featureText: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: TEXT_COLOR_DARK,
        marginBottom: 2,
    },
    featureDescription: {
        fontSize: 14,
        color: TEXT_COLOR_LIGHT,
    },
    joinButtonContainer: {
        marginTop: "auto",
        paddingBottom: 20,
    },
    joinButton: {
        borderRadius: 16,
        overflow: "hidden",
        ...Platform.select({
            ios: {
                shadowColor: PRIMARY_COLOR,
                shadowOffset: { width: 0,height: 6 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
            },
            android: {
                elevation: 8,
            },
        }),
    },
    joinButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 18,
        paddingHorizontal: 24,
    },
    joinButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
        marginLeft: 12,
    },
    // Error Styles
    errorContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorIconContainer: {
        width: 160,
        height: 160,
        borderRadius: 80,
        backgroundColor: "#FEF2F2",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 24,
    },
    errorTitle: {
        fontSize: 28,
        fontWeight: "700",
        color: TEXT_COLOR_DARK,
        marginBottom: 12,
        textAlign: "center",
    },
    errorMessage: {
        fontSize: 16,
        color: TEXT_COLOR_LIGHT,
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    errorButton: {
        borderRadius: 12,
        overflow: "hidden",
    },
    errorButtonGradient: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingVertical: 16,
    },
    errorButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
})
