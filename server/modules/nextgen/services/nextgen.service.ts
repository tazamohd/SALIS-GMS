/**
 * Next-gen service (Phase E — Domain Services).
 *
 * Owns the next-gen showcase rules: the generic garage-scoped list/create
 * passthroughs (Zod validation stays at the controller boundary) and the
 * `/api/vision/analyze-image` simulated-AI quality-control flow — which scores
 * an image, derives defects, persists a vision quality-check + its defect rows,
 * and returns the analysis summary. All data access flows through the repository.
 */

import type { NextGenRepository } from '../repositories/nextgen.repository';

interface DefectFinding {
  type: string;
  severity: string;
  description: string;
  confidence: number;
  location: { x: number; y: number };
}

export class NextGenService {
  constructor(private readonly repository: NextGenRepository) {}

  // Generic resource passthroughs (driven by the resource catalogue)
  list(path: string, garageId: string) {
    return this.repository.list(path, garageId);
  }
  create(path: string, data: unknown) {
    return this.repository.create(path, data);
  }

  // /api/vision/quality-checks — raw array (no { data } envelope)
  listQualityChecks(garageId: string) {
    return this.repository.list('vision-quality-checks', garageId);
  }

  // /api/vision/analyze-image — simulated AI analysis (GPT-5 Vision in prod)
  async analyzeImage(
    garageId: string,
    userId: string,
    body: { checkType?: string; vehicleId?: string; imageUrl?: string },
  ) {
    const { checkType, vehicleId } = body;

    const qualityScore = Math.floor(75 + Math.random() * 20);
    const defects: DefectFinding[] = [];

    if (qualityScore < 85) {
      defects.push({
        type: 'Paint Scratch',
        severity: qualityScore < 80 ? 'major' : 'minor',
        description: 'Surface scratch detected on left door panel',
        confidence: 0.92,
        location: { x: 120, y: 450 },
      });
    }

    if (qualityScore < 90) {
      defects.push({
        type: 'Alignment Issue',
        severity: 'minor',
        description: 'Minor panel gap detected',
        confidence: 0.78,
        location: { x: 340, y: 200 },
      });
    }

    // Create quality check record. vision_quality_checks requires image_url,
    // defects_detected and ai_model, keeps the score as a decimal string, and
    // links the vehicle by uuid — no 'demo-vehicle' sentinel.
    const check = (await this.repository.create('vision-quality-checks', {
      garageId,
      vehicleId: vehicleId || undefined,
      checkType: checkType || 'paint_inspection',
      imageUrl: body.imageUrl || 'simulated://no-image',
      defectsDetected: defects,
      qualityScore: qualityScore.toString(),
      passedInspection: qualityScore >= 80,
      inspectorId: userId,
      aiModel: 'gpt-5-vision',
      processingTimeMs: 2300,
    })) as { id: string };

    // Create defect records. vision_defects hangs off the quality check (no
    // garage_id/status columns), takes location as jsonb and confidence as a
    // decimal string.
    for (const defect of defects) {
      await this.repository.create('vision-defects', {
        qualityCheckId: check.id,
        defectType: defect.type,
        severity: defect.severity,
        description: defect.description,
        location: defect.location,
        confidence: defect.confidence.toString(),
      });
    }

    return {
      checkId: check.id,
      qualityScore,
      overallQuality: qualityScore >= 90 ? 'excellent' : qualityScore >= 80 ? 'good' : 'needs_attention',
      defects,
      recommendations: [
        'Schedule paint correction for detected scratches',
        'Inspect panel alignment during next service',
        'Document all defects for customer review',
      ],
    };
  }
}
