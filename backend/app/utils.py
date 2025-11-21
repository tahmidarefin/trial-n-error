from bcrypt import hashpw, gensalt, checkpw

def get_hashed_password(password: str):
  return hashpw(password.encode("utf-8"), gensalt()).decode("utf-8")

def verify_password(password: str, hashed_password: str):
  try:
    return checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))
  except:
    return False