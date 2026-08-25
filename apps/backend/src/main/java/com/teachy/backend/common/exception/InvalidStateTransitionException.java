package com.teachy.backend.common.exception;

public class InvalidStateTransitionException extends RuntimeException {
  public InvalidStateTransitionException(String message) {
    super(message);
  }
}
