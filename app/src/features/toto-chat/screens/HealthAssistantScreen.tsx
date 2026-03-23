import React from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { MessageComposer } from '../components/MessageComposer';
import { ChatList } from '../components/ChatList';
import { TelegramMediaPicker } from '../components/TelegramMediaPicker';
import { DateTimeCollector, SeverityCollector, MgCollector } from '../components/InlineSlots';
import { SymptomPlan } from '../components/SymptomPlan';
import { TortoAvatar } from '../components/TortoAvatar';
import { AshParticles } from '../components/AshParticles';
import ChatHeader from './components/ChatHeader';
import ChatHistoryDrawer from './components/ChatHistoryDrawer';
import NewChatModal from './components/NewChatModal';
import ImageInputModal from './components/ImageInputModal';
import PlanHistoryModal from './components/PlanHistoryModal';
import TimelineHistoryModal from './components/TimelineHistoryModal';
import { useHealthAssistant } from '../hooks/useHealthAssistant';
import { styles } from './HealthAssistantScreen.styles';
import { togglesMark } from '../assistant/commandBus';

const HealthAssistantScreen: React.FC = () => {
  const {
    messages,
    inputText,
    setInputText,
    sendAnim,
    showMediaPicker,
    setShowMediaPicker,
    isLoading,
    scrollViewRef,
    autoScrollEnabledRef,
    showChatHistory,
    setShowChatHistory,
    showNewChatModal,
    setShowNewChatModal,
    newChatModalTranslateY,
    chatSessions,
    setChatSessions,
    historyLoading,
    historyError,
    showMessagesAshAnimation,
    messagesFadeAnim,
    messagesContainerRef,
    messagesContainerLayout,
    setMessagesContainerLayout,
    waveformAnimValues,
    streamingMessageId,
    pendingCommand,
    setPendingCommand,
    isDispatching,
    activeSymptomPlan,
    activeSymptomId,
    toggleState,
    setToggleState,
    showPlanHistory,
    setShowPlanHistory,
    planHistoryLoading,
    planHistory,
    showTimelineHistory,
    setShowTimelineHistory,
    timelineHistoryLoading,
    timelineHistory,
    timelineHistoryTitle,
    showImageInputModal,
    setShowImageInputModal,
    selectedImage,
    imageInputText,
    setImageInputText,
    dot1Anim,
    dot2Anim,
    dot3Anim,
    handleSendWithAnimation,
    humanizeCommand,
    openTimelineHistory,
    confirmPendingCommand,
    handleImageSelected,
    handleDocumentSelected,
    handleVoiceInput,
    sendImageWithText,
    handleDocumentInput,
    dismissNewChatModal,
    startNewChat,
    loadSession,
    retryLoadHistory,
    handleLoadPlanHistory,
  } = useHealthAssistant();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.telegramBackground} />

      <ChatHeader
        isLoading={isLoading}
        streamingMessageId={streamingMessageId}
        onMenuPress={() => setShowChatHistory(true)}
        onNewChatPress={() => setShowNewChatModal(true)}
        styles={styles}
      />

      <ChatHistoryDrawer
        visible={showChatHistory}
        chatSessions={chatSessions}
        historyLoading={historyLoading}
        historyError={historyError}
        onClose={() => setShowChatHistory(false)}
        onLoadSession={loadSession}
        onSessionDeleted={(id) => setChatSessions(prev => prev.filter(s => s.id !== id))}
        onRetry={retryLoadHistory}
        styles={styles}
      />

      <NewChatModal
        visible={showNewChatModal}
        translateY={newChatModalTranslateY}
        onDismiss={dismissNewChatModal}
        onStartWithMemory={() => { dismissNewChatModal(); setTimeout(() => startNewChat(true), 260); }}
        onStartWithoutMemory={() => { dismissNewChatModal(); setTimeout(() => startNewChat(false), 260); }}
        styles={styles}
      />

      <ImageInputModal
        visible={showImageInputModal}
        selectedImage={selectedImage}
        imageInputText={imageInputText}
        onTextChange={setImageInputText}
        onClose={() => setShowImageInputModal(false)}
        onSend={sendImageWithText}
        styles={styles}
      />

      <KeyboardAvoidingView style={styles.keyboardContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {pendingCommand?.type === 'APPT_RESCHEDULE_DENTIST' && (
          <DateTimeCollector label="Pick new date & time" onPicked={(iso, time) => { setPendingCommand({ type: 'APPT_RESCHEDULE_DENTIST', payload: { ...(pendingCommand as any).payload, newDate: iso, newTime: time } }); }} />
        )}
        {pendingCommand?.type === 'SYMPTOM_LOG_LEG_PAIN' && (
          <SeverityCollector onPicked={(sev) => { setPendingCommand({ type: 'SYMPTOM_LOG_LEG_PAIN', payload: { ...(pendingCommand as any).payload, severity: sev } }); }} />
        )}
        {pendingCommand?.type === 'SUPPLEMENT_VITC_RECOMMEND' && (
          <MgCollector onPicked={(mg) => { setPendingCommand({ type: 'SUPPLEMENT_VITC_RECOMMEND', payload: { ...(pendingCommand as any).payload, dosePreferenceMg: mg } }); }} />
        )}

        <View ref={messagesContainerRef} onLayout={(e) => { const { x, y, width, height } = e.nativeEvent.layout; setMessagesContainerLayout({ x, y, width, height }); }} style={{ flex: 1, position: 'relative' }}>
          <Animated.View style={{ flex: 1, opacity: messagesFadeAnim }}>
            <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} onContentSizeChange={() => { if (autoScrollEnabledRef.current) scrollViewRef.current?.scrollToEnd({ animated: true }); }} onScrollBeginDrag={() => { autoScrollEnabledRef.current = false; }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <ChatList
                messages={messages.filter(msg => msg && msg.id && msg.content && msg.role).map(msg => ({ id: msg.id, clientId: msg.id, text: msg.content, role: msg.role, status: (msg as any).status || 'sent', timestamp: msg.timestamp }))}
                onMessageLayout={(clientId, rect) => { sendAnim.setEndRect(clientId, rect); }}
                streamingId={streamingMessageId || undefined}
              />
            </ScrollView>
          </Animated.View>
          {showMessagesAshAnimation && (
            <View style={[styles.ashOverlay, { position: 'absolute', top: 0, left: 0, width: messagesContainerLayout.width || '100%', height: messagesContainerLayout.height || '100%' }]}>
              <AshParticles visible={showMessagesAshAnimation} onComplete={() => {}} />
            </View>
          )}
        </View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <View style={styles.assistantAvatar}><TortoAvatar state="thinking" size={28} /></View>
            <View style={styles.loadingContent}>
              <View style={styles.loadingDots}>
                <Animated.View style={[styles.loadingDot, { transform: [{ scale: dot1Anim }] }]} />
                <Animated.View style={[styles.loadingDot, { transform: [{ scale: dot2Anim }] }]} />
                <Animated.View style={[styles.loadingDot, { transform: [{ scale: dot3Anim }] }]} />
              </View>
            </View>
          </View>
        )}

        {pendingCommand && (
          <View style={styles.confirmBar}>
            <Text style={styles.confirmText}>{humanizeCommand(pendingCommand)}</Text>
            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={[styles.confirmBtn, styles.confirmBtnPrimary]} onPress={confirmPendingCommand} disabled={isDispatching}>
                <Text style={styles.confirmBtnText}>{isDispatching ? 'Working…' : 'Confirm & Log'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, styles.confirmBtnSecondary]} onPress={() => setPendingCommand(null)} disabled={isDispatching}>
                <Text style={styles.confirmBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {pendingCommand?.type === 'SUPPLEMENT_VITC_RECOMMEND' && (
          <View style={styles.historyLinkRow}><TouchableOpacity onPress={() => openTimelineHistory('Supplement', 'Supplement History')}><Text style={styles.historyLinkText}>View supplement history</Text></TouchableOpacity></View>
        )}
        {pendingCommand?.type === 'APPT_RESCHEDULE_DENTIST' && (
          <View style={styles.historyLinkRow}><TouchableOpacity onPress={() => openTimelineHistory('Appointment', 'Appointment History')}><Text style={styles.historyLinkText}>View appointment history</Text></TouchableOpacity></View>
        )}
        {pendingCommand?.type === 'LAB_SUBMIT_RESULTS' && (
          <View style={styles.historyLinkRow}><TouchableOpacity onPress={() => openTimelineHistory('Lab', 'Lab History')}><Text style={styles.historyLinkText}>View lab history</Text></TouchableOpacity></View>
        )}

        {activeSymptomPlan && (
          <View style={styles.planContainer}>
            <View style={styles.planHeader}>
              <Text style={styles.planHeaderText}>Leg pain recovery plan</Text>
              <Text style={styles.planCompletion}>{Object.values(toggleState).filter(Boolean).length}/{(activeSymptomPlan.steps || []).length}</Text>
            </View>
            <SymptomPlan plan={activeSymptomPlan} onToggle={async (toggleKey, completed) => {
              setToggleState(prev => ({ ...prev, [toggleKey]: completed }));
              try { await togglesMark({ toggleKey, completed, symptomId: activeSymptomId || undefined }); }
              catch { setToggleState(prev => ({ ...prev, [toggleKey]: !completed })); }
            }} />
            <View style={{ paddingHorizontal: 16, marginTop: 8, alignItems: 'flex-end' }}>
              <TouchableOpacity onPress={handleLoadPlanHistory}>
                <Text style={{ color: '#93C5FD', fontWeight: '700', fontSize: 12 }}>View history</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <MessageComposer
          onSend={handleSendWithAnimation}
          disabled={isLoading}
          onAttachPress={() => setShowMediaPicker(true)}
          onMicPress={handleVoiceInput}
          hasChatted={messages.some(m => m.role === 'user')}
        />
      </KeyboardAvoidingView>

      <PlanHistoryModal
        visible={showPlanHistory}
        loading={planHistoryLoading}
        planHistory={planHistory}
        onClose={() => setShowPlanHistory(false)}
        styles={styles}
      />

      <TimelineHistoryModal
        visible={showTimelineHistory}
        loading={timelineHistoryLoading}
        title={timelineHistoryTitle}
        timelineHistory={timelineHistory}
        onClose={() => setShowTimelineHistory(false)}
        styles={styles}
      />

      <TelegramMediaPicker
        visible={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onImageSelected={handleImageSelected}
        onDocumentSelected={handleDocumentSelected}
      />
    </View>
  );
};

export default HealthAssistantScreen;
