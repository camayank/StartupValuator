import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import type { PitchDeckFormData } from '../validations/pitch-deck';

// Define PDF styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    lineHeight: 1.5,
  },
});

interface PitchDeckDocumentProps {
  content: PitchDeckFormData;
}

export function createPitchDeckDocument({ content }: PitchDeckDocumentProps) {
  return new Document({
    children: [
      new Page({
        style: styles.page,
        children: [
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.title, children: content.companyName }),
              new Text({ style: styles.subtitle, children: content.tagline }),
            ],
          }),
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.sectionTitle, children: "Problem" }),
              new Text({ style: styles.text, children: content.problem }),
            ],
          }),
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.sectionTitle, children: "Solution" }),
              new Text({ style: styles.text, children: content.solution }),
            ],
          }),
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.sectionTitle, children: "Market Size" }),
              new Text({ style: styles.text, children: content.marketSize }),
            ],
          }),
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.sectionTitle, children: "Business Model" }),
              new Text({ style: styles.text, children: content.businessModel }),
            ],
          }),
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.sectionTitle, children: "Competition" }),
              new Text({ style: styles.text, children: content.competition }),
            ],
          }),
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.sectionTitle, children: "Traction" }),
              new Text({ style: styles.text, children: content.traction }),
            ],
          }),
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.sectionTitle, children: "Team" }),
              new Text({ style: styles.text, children: content.team }),
            ],
          }),
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.sectionTitle, children: "Financials" }),
              new Text({ style: styles.text, children: content.financials }),
            ],
          }),
          new View({
            style: styles.section,
            children: [
              new Text({ style: styles.sectionTitle, children: "Funding Ask" }),
              new Text({ style: styles.text, children: content.fundingAsk }),
              new Text({ style: styles.text, children: content.useOfFunds }),
            ],
          }),
        ],
      }),
    ],
  });
}