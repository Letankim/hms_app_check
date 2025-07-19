import React,{ useEffect,useState,useRef } from 'react';
import { View,Text,TouchableOpacity,StyleSheet,Animated } from 'react-native';
import { FontAwesome,Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { showInfoMessage } from 'utils/toastUtil';

const IncomingCallNotification = ({ incomingCall,setIncomingCall }) => {
    const navigation = useNavigation();
    const [countdown,setCountdown] = useState(30);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const soundRef = useRef(null);
    const timerRef = useRef(null);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const startShaking = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shakeAnim,{
                    toValue: -5,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim,{
                    toValue: 5,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim,{
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const rejectCall = async () => {
        try {
            console.log('Calling reject API for roomId:',incomingCall?.roomId);
            showInfoMessage("The call has been canceled");
        } catch (error) {
            console.error('Error rejecting call:',error);
        }

        setIncomingCall(null);
    };

    useEffect(() => {
        const playSound = async () => {
            try {
                const { sound } = await Audio.Sound.createAsync(
                    require('../../../assets/sounds/ringtones.mp3')
                );
                soundRef.current = sound;
                await sound.playAsync();
            } catch (error) {
                console.error('Error playing ringtone:',error);
            }
        };

        if (incomingCall) {
            setCountdown(30);
            playSound();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

            timerRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        rejectCall();
                        return 0;
                    }
                    return prev - 1;
                });
            },1000);

            Animated.timing(fadeAnim,{
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();

            Animated.timing(fadeAnim,{
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                startShaking();
            });

        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (soundRef.current) {
                soundRef.current.stopAsync();
                soundRef.current.unloadAsync();
            }
        };
    },[incomingCall]);

    if (!incomingCall) return null;

    return (
        <Animated.View style={[styles.overlay,{ opacity: fadeAnim }]}>
            <View style={styles.popup}>
                <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                    <Ionicons name="call-outline" size={60} color="#2563EB" style={styles.icon} />
                </Animated.View>
                <Text style={styles.title}>{incomingCall.callerName}</Text>
                <Text style={styles.subtitle}>Incoming Call • {countdown}s</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button,styles.declineButton]}
                        onPress={() => {
                            if (timerRef.current) clearInterval(timerRef.current);
                            rejectCall();
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        }}
                    >
                        <FontAwesome name="close" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Decline</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button,styles.acceptButton]}
                        onPress={() => {
                            if (timerRef.current) clearInterval(timerRef.current);
                            setIncomingCall(null);
                            navigation.navigate('VideoCallSupport',{
                                roomId: incomingCall.roomId,
                            });
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                        }}
                    >
                        <Ionicons name="call" size={24} color="#fff" />
                        <Text style={styles.buttonText}>Accept</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
    },
    popup: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 24,
        width: 340,
        alignItems: 'center',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0,height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
    },
    icon: {
        marginBottom: 16,
        transform: [{ scale: 1.1 }],
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#1A1A1A',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 24,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 16,
        marginHorizontal: 8,
    },
    declineButton: {
        backgroundColor: '#FF3B30',
    },
    acceptButton: {
        backgroundColor: '#00C4B4',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});

export default IncomingCallNotification;