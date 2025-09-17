'use client';

import React, { useState, useRef, useEffect } from 'react';
import { searchSkills, canonicalizeSkill, deduplicateSkills } from '@/lib/skills-library';
import { X, Plus } from 'lucide-react';

interface SkillsInputProps {
  value: string[];
  onChange: (skills: string[]) => void;
  type: 'hard' | 'soft';
  maxSkills?: number;
  placeholder?: string;
  className?: string;
}

export default function SkillsInput({
  value,
  onChange,
  type,
  maxSkills = type === 'hard' ? 12 : 6,
  placeholder = `Type to add ${type} skills...`,
  className = ''
}: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update suggestions when input changes
  useEffect(() => {
    if (inputValue.length >= 2) {
      const results = searchSkills(inputValue, type, 8);
      // Filter out already selected skills
      const filtered = results.filter(skill => 
        !value.some(existing => canonicalizeSkill(existing) === canonicalizeSkill(skill))
      );
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setFocusedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [inputValue, value, type]);

  // Handle skill addition
  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    
    const canonical = canonicalizeSkill(skill.trim());
    const exists = value.some(existing => canonicalizeSkill(existing) === canonical);
    
    if (!exists && value.length < maxSkills) {
      const newSkills = deduplicateSkills([...value, canonical]);
      onChange(newSkills);
    }
    
    setInputValue('');
    setShowSuggestions(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle skill removal
  const removeSkill = (index: number) => {
    const newSkills = value.filter((_, i) => i !== index);
    onChange(newSkills);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      if (focusedIndex >= 0 && suggestions[focusedIndex]) {
        addSkill(suggestions[focusedIndex]);
      } else if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setFocusedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last skill if input is empty
      removeSkill(value.length - 1);
    } else if (e.key === ',' || e.key === ';') {
      // Handle comma/semicolon separation
      e.preventDefault();
      if (inputValue.trim()) {
        addSkill(inputValue);
      }
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const skillColor = type === 'hard' ? 'blue' : 'purple';
  const atMaxSkills = value.length >= maxSkills;

  return (
    <div className={`relative ${className}`}>
      {/* Skills chips container */}
      <div className={`min-h-[3rem] p-3 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-${skillColor}-500 focus-within:border-${skillColor}-500 transition-all`}>
        <div className="flex flex-wrap gap-2 items-center">
          {/* Existing skills as chips */}
          {value.map((skill, index) => (
            <div
              key={index}
              className={`inline-flex items-center gap-1 px-3 py-1 bg-${skillColor}-100 text-${skillColor}-800 rounded-full text-sm font-medium`}
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className={`p-0.5 hover:bg-${skillColor}-200 rounded-full transition-colors`}
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {/* Input field */}
          {!atMaxSkills && (
            <div className="flex-1 min-w-[120px]">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => inputValue.length >= 2 && setShowSuggestions(suggestions.length > 0)}
                placeholder={value.length === 0 ? placeholder : ''}
                className="w-full border-none outline-none bg-transparent text-sm placeholder-gray-400"
                autoComplete="off"
              />
            </div>
          )}
          
          {/* Add button when at max or no input */}
          {(atMaxSkills || value.length === 0) && (
            <div className="flex items-center text-gray-400">
              <Plus className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addSkill(suggestion)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                index === focusedIndex ? `bg-${skillColor}-50 text-${skillColor}-700` : 'text-gray-900'
              }`}
            >
              {suggestion}
            </button>
          ))}
          
          {/* Allow custom skill addition */}
          {inputValue.trim() && !suggestions.some(s => s.toLowerCase() === inputValue.toLowerCase()) && (
            <button
              type="button"
              onClick={() => addSkill(inputValue)}
              className={`w-full px-4 py-2 text-left text-sm border-t hover:bg-gray-50 transition-colors ${
                focusedIndex === suggestions.length ? `bg-${skillColor}-50 text-${skillColor}-700` : 'text-gray-600'
              }`}
            >
              <span className="font-medium">Add &quot;{inputValue}&quot;</span>
            </button>
          )}
        </div>
      )}

      {/* Helper text */}
      <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
        <span>
          {value.length === 0 
            ? `Type to search ${type} skills, press Enter to add custom skills`
            : `${value.length}/${maxSkills} skills added`
          }
        </span>
        {value.length > 0 && (
          <span>
            Press Backspace to remove last skill
          </span>
        )}
      </div>
    </div>
  );
}
