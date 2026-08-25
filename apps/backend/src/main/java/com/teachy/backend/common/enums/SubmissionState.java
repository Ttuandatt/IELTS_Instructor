package com.teachy.backend.common.enums;

import java.util.Map;
import java.util.Set;

public enum SubmissionState {
    DRAFT, SUBMITTED, AI_SCORED, AI_FAILED, RELEASED_AI, PENDING_REVIEW, FINALIZED;

    /**
     * Writing submission state machine — defines which transitions are legal.
     *
     * <pre>
     * DRAFT ──► SUBMITTED ──► AI_SCORED ──► RELEASED_AI ──► FINALIZED
     *               ▲    └──► AI_FAILED ──┘     │    └──► PENDING_REVIEW ──► FINALIZED
     *               └─────────────────────┘     └──► PENDING_REVIEW ──────────┘
     * </pre>
     * <p>
     * Key: current state → Value: set of allowed target states.
     * FINALIZED is terminal — no outbound transitions.
     */
    private static final Map<SubmissionState, Set<SubmissionState>> TRANSITIONS = Map.of(
            DRAFT, Set.of(SUBMITTED),
            SUBMITTED, Set.of(AI_SCORED, AI_FAILED),
            AI_SCORED, Set.of(RELEASED_AI, PENDING_REVIEW),
            AI_FAILED, Set.of(SUBMITTED),
            RELEASED_AI, Set.of(PENDING_REVIEW, FINALIZED),
            PENDING_REVIEW, Set.of(FINALIZED),
            FINALIZED, Set.of()
    );

    public boolean canTransitionTo(SubmissionState target) {
        return TRANSITIONS.getOrDefault(this, Set.of()).contains(target);
    }

    public SubmissionState transitionTo(SubmissionState target) {
        if (!canTransitionTo(target)) {
            throw new IllegalStateException("Cannot transition from " + this + " to " + target);
        }
        return target;
    }
}
