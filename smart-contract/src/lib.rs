use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint,
    entrypoint::ProgramResult,
    program::invoke,
    pubkey::Pubkey,
    system_instruction,
    program_error::ProgramError,
};

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let student_account = next_account_info(account_info_iter)?;
    let expert_account = next_account_info(account_info_iter)?;

    if !student_account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }

    if instruction_data.len() != 8 {
        return Err(ProgramError::InvalidInstructionData);
    }

    let amount = u64::from_le_bytes(instruction_data.try_into().unwrap());

    invoke(
        &system_instruction::transfer(student_account.key, expert_account.key, amount),
        &[student_account.clone(), expert_account.clone()],
    )?;

    Ok(())
}