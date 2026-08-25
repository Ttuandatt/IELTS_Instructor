package com.teachy.backend.common.exception;

import com.teachy.backend.common.enums.SubmissionState;

public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(SubmissionState from, SubmissionState to) {
        super("Cannot transition from " + from + " to " + to);
    }
}
