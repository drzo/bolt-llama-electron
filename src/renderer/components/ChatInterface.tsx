/**
 * Chat Interface Component - Handles user prompts and AI responses
 */

import React, { useRef, useEffect, useState } from 'react';
import { useChatStore } from '../stores/chatStore';
import { useProjectStore } from '../stores/projectStore';
import { IPCClient } from '../utils/ipc-client';
import { GenerationRequest } from '@shared/types';
import '../styles/chat.scss';

export const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('codellama-7b-instruct.Q4_K_M.gguf');
  const [models, setModels] = useState<string[]>([]);
  const [streamingText, setStreamingText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const messages = useChatStore((state) => state.messages);
  const isLoading = useChatStore((state) => state.isLoading);
  const error = useChatStore((state) => state.error);
  const addMessage = useChatStore((state) => state.addMessage);
  const setLoading = useChatStore((state) => state.setLoading);
  const setError = useChatStore((state) => state.setError);

  const projectName = useProjectStore((state) => state.projectName);
  const currentFile = useProjectStore((state) => state.currentFile);

  // Load available models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const availableModels = await IPCClient.getModels();
        setModels(availableModels);
      } catch (err) {
        console.error('Failed to load models:', err);
      }
    };

    loadModels();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  // Subscribe to stream events
  useEffect(() => {
    const unsubscribeStart = IPCClient.onStreamStart(() => {
      setStreamingText('');
    });

    const unsubscribeChunk = IPCClient.onStreamChunk((chunk) => {
      setStreamingText((prev) => prev + chunk);
    });

    const unsubscribeEnd = IPCClient.onStreamEnd((metadata) => {
      console.log('Stream ended:', metadata);
      setStreamingText('');
    });

    const unsubscribeError = IPCClient.onStreamError((error) => {
      console.error('Stream error:', error);
      setError(error);
      setStreamingText('');
    });

    return () => {
      unsubscribeStart();
      unsubscribeChunk();
      unsubscribeEnd();
      unsubscribeError();
    };
  }, [setError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) {
      return;
    }

    // Add user message
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user' as const,
      content: input,
      timestamp: Date.now(),
    };

    addMessage(userMessage);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      // Build context from current project
      let context = '';
      if (projectName) {
        context += `Project: ${projectName}\n`;
      }
      if (currentFile) {
        context += `Current file: ${currentFile}\n`;
      }

      // Generate code
      const request: GenerationRequest = {
        prompt: input,
        context,
        model: selectedModel,
        temperature: 0.7,
        maxTokens: 2048,
      };

      const response = await IPCClient.generateCode(request);

      // Add assistant message
      const assistantMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant' as const,
        content: response.code,
        timestamp: Date.now(),
        tokens: response.tokens,
        generationTime: response.generationTime,
      };

      addMessage(assistantMessage);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error('Generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    IPCClient.cancelGeneration();
    setLoading(false);
    setStreamingText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h2>AI Assistant</h2>
        <div className="model-selector">
          <label htmlFor="model-select">Model:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={isLoading}
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model.replace('.Q4_K_M.gguf', '')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && !streamingText && (
          <div className="chat-empty">
            <p>Start a conversation to generate code</p>
            <p className="hint">Describe what you want to build...</p>
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={`chat-message ${message.role}`}>
            <div className="message-header">
              <span className="role">{message.role === 'user' ? '👤 You' : '🤖 Assistant'}</span>
              {message.generationTime && (
                <span className="metadata">
                  {message.tokens} tokens • {(message.generationTime / 1000).toFixed(2)}s
                </span>
              )}
            </div>
            <div className="message-content">
              {message.role === 'assistant' ? (
                <pre>
                  <code>{message.content}</code>
                </pre>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}

        {streamingText && (
          <div className="chat-message assistant streaming">
            <div className="message-header">
              <span className="role">🤖 Assistant</span>
              <span className="status">Generating...</span>
            </div>
            <div className="message-content">
              <pre>
                <code>{streamingText}</code>
              </pre>
            </div>
          </div>
        )}

        {error && (
          <div className="chat-message error">
            <div className="message-header">
              <span className="role">⚠️ Error</span>
            </div>
            <div className="message-content">
              <p>{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you want to build... (Ctrl+Enter to send)"
          disabled={isLoading}
          rows={3}
        />

        <div className="chat-actions">
          {isLoading ? (
            <button type="button" onClick={handleCancel} className="btn-cancel">
              Cancel
            </button>
          ) : (
            <button type="submit" disabled={!input.trim() || isLoading} className="btn-send">
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
